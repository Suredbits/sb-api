import makeDebug from 'debug'
import * as t from 'io-ts'
import WebSocket from 'ws'

import { BitcoinNetwork, LightningApi } from '../../lightning'
import { MessageTypes, Validate } from '../../types'
import { ExchangeSymbols } from '../../types/exchange/common/symbols'
import { ExchangeSpotTypes, SpotExchange } from '../../types/exchange/spot'
import { Omit } from '../../types/util'
import { UUID } from '../../uuid'
import { API } from '../common'
import { AtleastUUID, OnWsOpen, SbWebSocket } from '../common'

export type ExchangeChannel = Channels
type Channels = 'tickers' | 'trades' | 'books'

const debug = makeDebug('sb-api:socket:exchange')

interface SubScribeArgs<E extends SpotExchange, C extends ExchangeChannel> {
  /**
   * Which exchange to subscribe to
   */
  exchange: E

  /**
   * Which trading symbol (currency pair) to
   * subscribe to
   */
  symbol: ExchangeSymbols<E>

  channel: C
  /**
   * Duration of subscription, in **milliseconds**
   */
  duration: number

  /**
   * If refundInvoice is not supplied, we ask your LN client
   * to generate one.
   */
  refundInvoice?: string

  /**
   * Callback that gets executed when the *snapshot* is received.
   * A snapshot in this context is the pre-existing date that's
   * neeeded to follow along the updates that's happening on a
   * given exchange. If you're subscribing to book updates, for
   * example, you'd use the snapshot to initialize your view
   * of the order book, and then use the received updates to
   * keep your view of the book in sync with what's happening
   * on the exchange.
   */
  onSnapshot: (snapshot: ExchangeSpotTypes.SpotSnapshot<C, E>) => any

  /**
   * Callback that gets executed when a data point is received.
   */
  onData: (data: ExchangeSpotTypes.Data<C, E>) => any

  /**
   * Callback that gets executed when a subscription is ended.
   * The argument that gets passed into this function is a list
   * of all previously collected data points.
   */
  onSubscriptionEnded?: (datapoint: Array<ExchangeSpotTypes.Data<C, E>>) => any
}

interface Subscription {
  refill: (addedDuration: number) => Promise<any> // TODO fix me
  unsubscribe: () => Promise<any> // TODO fix me
}

abstract class ExchangeSocketBase extends SbWebSocket {
  constructor(protected ln: LightningApi, network: BitcoinNetwork, onOpen: OnWsOpen) {
    super(API.spot, ln, onOpen, network)
  }

  private handleRefill = async (addedDuration: number, uuid: string): Promise<any> => {
    const msg = { uuid, addedDuration, event: 'refill' }
    debug(`Refilling subscription with UUID ${uuid}`)
    debug('Sending %O', msg)
    this.ws.send(JSON.stringify(msg))
  }

  private handleUnsubscribe = async (uuid: string): Promise<any> => {
    const msg = { uuid, event: 'unsubscribe' }
    debug(`Sending unsubscription request with UUID ${uuid}`)
    debug('Sending %O', msg)
    this.ws.send(JSON.stringify(msg))
  }

  protected handleMessage = async (uuid: string, parsed: AtleastUUID, wsData: WebSocket.Data) => {
    if (MessageTypes.isInvoice(parsed)) {
      debug(`Got invoice for request with UUID ${uuid}`)

      const paymentResult = await this.ln.send(parsed.invoice)
      debug('Paid invoice: %O', paymentResult)
    } else if (MessageTypes.isPaymentReceived(parsed)) {
      debug(`Payment received for ${parsed.uuid}`)
    } else {
      const sub = this.subscriptions[uuid]
      if (!sub) {
        debug(
          'Got message with UUID for subscription not found in active subscriptions map! UUID: %s. Subscriptions map: %O',
          uuid,
          this.subscriptions
        )
      } else {
        if (MessageTypes.isSnapshot(parsed)) {
          const { snapshot } = parsed
          debug(`Received snapshot for ${uuid} with ${snapshot.length} elements`)
          const newSub: ActiveSubscription<t.Type<any>> = {
            ...sub,
            activated: true,
          }
          this.subscriptions[uuid] = newSub
          const validated = Validate.snapshot(wsData, sub.snapshotType, this.onSnapshotValidationError)
          const { onSnapshot } = sub
          onSnapshot(validated.snapshot)
        } else if (MessageTypes.isExchangeDataResponse(parsed, sub.dataType)) {
          const { data } = parsed
          debug(`Received data for ${uuid}`)
          debug('Data: %O', data)
          const validated = Validate.data(wsData, sub.dataType, this.onDataValidationError)
          this.addDataPoint(uuid, validated.data)
          sub.datapoints = [...sub.datapoints]
          sub.onData(validated.data)
        } else if (MessageTypes.isTimeWarning(parsed)) {
          debug(`Received time warning message for ${uuid}, ${parsed.warnings.duration / 1000} seconds left`)
        } else if (MessageTypes.isUnubscribed(parsed)) {
          debug(`Subscription ${uuid} has ended`)
          if (sub.onSubscriptionEnded) {
            sub.onSubscriptionEnded(sub.datapoints)
          }
        } else {
          debug("Don't know what to do with message %O", parsed)
        }
      }
    }
  }

  private addDataPoint = (uuid: string, data: object): void => {
    const sub = this.subscriptions[uuid]
    if (!sub) {
      debug(`Trying to add datapoint to sub ${uuid}, couldn't find sub`)
      return
    }
    sub.datapoints = [...sub.datapoints, data as any]
    debug(`Added datapoint to sub ${uuid}`)
  }

  private onSnapshotValidationError = (err: any) => {
    debug('Error happened while validating snapshot! %O', err)
    // TODO something else here
  }

  private onDataValidationError = (err: any) => {
    debug('Error happened while validating data! %O', err)
    // TODO something else here
  }

  protected subscribe = async <E extends SpotExchange, C extends ExchangeChannel>({
    symbol,
    refundInvoice,
    channel,
    exchange,
    onData,
    onSnapshot,
    onSubscriptionEnded,
    duration,
  }: SubScribeArgs<E, C>): Promise<Subscription> => {
    // If user hasn't supplied invoice, we generate one
    if (!refundInvoice) {
      refundInvoice = await this.ln.receive()
    }

    const req = {
      event: 'subscribe',
      uuid: UUID.newUUID(),
      symbol,
      refundInvoice,
      channel,
      exchange,
      duration,
    }
    this.ws.send(JSON.stringify(req))
    debug(`Sending subscription request with UUID ${req.uuid}`)
    debug('Request: %O', req) // TODO set to debug

    return new Promise<Subscription>((resolve, reject) => {
      const types = ExchangeSpotTypes.DataTypes[req.channel][req.exchange]

      this.subscriptions[req.uuid] = {
        activated: false,
        snapshotType: types.snapshot,
        dataType: types.data,
        onSnapshot,
        onData,
        onSubscriptionEnded: onSubscriptionEnded as any,
        datapoints: [],
        refundInvoice: req.refundInvoice,
      }
      const subscription: Subscription = {
        refill: addedDuration => this.handleRefill(addedDuration, req.uuid),
        unsubscribe: () => this.handleUnsubscribe(req.uuid),
      }
      resolve(subscription)
    }) as any
  }

  private subscriptions: {
    [uuid: string]: ActiveSubscription<t.Any> | undefined
  } = {}
}

export class ExchangeSpotSocket extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.mainnet, onOpen)
  }

  public tickers = <E extends SpotExchange>(args: Tickers<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'tickers' as any, ...args })

  public books = <E extends SpotExchange>(args: Books<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'books' as any, ...args })

  public trades = <E extends SpotExchange>(args: Trades<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'trades' as any, ...args })
}

/**
 *
 */
export class ExchangeSpotSocketTestnet extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.testnet, onOpen)
  }

  private getSymbol = <E extends SpotExchange>(exchange: E): ExchangeSymbols<E> => {
    if (exchange === 'binance') {
      return 'BCTUSDT' as any
    } else {
      return 'BTCUSD' as any
    }
  }

  public tickers = <E extends SpotExchange>(args: TestnetArgs<Tickers<E>>): Promise<Subscription> => {
    return this.subscribe({
      channel: 'tickers' as any,
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }

  public books = <E extends SpotExchange>(args: TestnetArgs<Books<E>>): Promise<Subscription> => {
    return this.subscribe({
      channel: 'books' as any,
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }

  public trades = <E extends SpotExchange>(args: TestnetArgs<Trades<E>>): Promise<Subscription> => {
    return this.subscribe({
      channel: 'trades' as any,
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }
}

type Trades<E extends SpotExchange> = NoChannel<SubScribeArgs<E, 'trades'>>
type Tickers<E extends SpotExchange> = NoChannel<SubScribeArgs<E, 'tickers'>>
type Books<E extends SpotExchange> = NoChannel<SubScribeArgs<E, 'books'>>
type NoChannel<T> = Omit<T, 'channel'>
type TestnetArgs<T> = Omit<T, 'symbol'>

interface ActiveSubscription<T extends t.Type<any>> {
  activated: boolean
  snapshotType: t.Type<any>
  dataType: t.TypeOf<T>
  onSnapshot: (data: any) => any
  onData: (data: any) => any
  onSubscriptionEnded?: (datapoints: Array<Datapoint<T>>) => any
  datapoints: Array<Datapoint<T>>
  refundInvoice: string
}

interface Datapoint<T> {
  data: T
  /**
   * epoch time
   */
  timestamp: number
}
