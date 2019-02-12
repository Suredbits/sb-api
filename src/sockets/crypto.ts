import makeDebug from 'debug'
import * as t from 'io-ts'
import genUuid from 'uuid'
import WebSocket from 'ws'

import { BitcoinNetwork, LightningApi } from '../lightning'
import { MessageTypes, Validate } from '../types'
import { Exchange, ExchangeTypes } from '../types/exchange'
import { ExchangeSymbols } from '../types/exchange/symbols'
import { Omit } from '../types/util'
import { API } from './common'
import { AtleastUUID, OnWsOpen, SbWebSocket } from './common'

export type ExchangeChannel = 'tickers' | 'trades' | 'books'

const debug = makeDebug('socket:exchange')

interface SubScribeArgs<C extends ExchangeChannel, E extends Exchange> {
  exchange: E
  symbol: ExchangeSymbols<E>
  channel: C
  duration: number
  refundInvoice: string
  onSnapshot: (snapshot: ExchangeTypes.Snapshot<C, E>) => any
  onData: (data: ExchangeTypes.Data<C, E>) => any
  onSubscriptionEnded?: (datapoint: Array<ExchangeTypes.Data<C, E>>) => any
}

interface Subscription {
  refill: (addedDuration: number) => Promise<any> // TODO fix me
  unsubscribe: () => Promise<any> // TODO fix me
}

abstract class ExchangeSocketBase extends SbWebSocket {
  constructor(protected ln: LightningApi, network: BitcoinNetwork, onOpen: OnWsOpen) {
    super(API.crypto, ln, onOpen, network)
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
    debug('Received message in exchange socket %O', parsed)
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

  protected subscribe = <C extends ExchangeChannel, E extends Exchange>({
    symbol,
    refundInvoice,
    channel,
    exchange,
    onData,
    onSnapshot,
    onSubscriptionEnded,
    duration,
  }: SubScribeArgs<C, E>): C extends 'books'
    ? (E extends 'binance' ? never : Promise<Subscription>)
    : Promise<Subscription> => {
    const req = {
      event: 'subscribe',
      uuid: genUuid(),
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
      const types = ExchangeTypes.DataTypes[req.channel][req.exchange]
      this.subscriptions[req.uuid] = {
        activated: false,
        snapshotType: types.snapshot,
        dataType: types.data,
        onSnapshot,
        onData,
        onSubscriptionEnded,
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

export class ExchangeSocket extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.mainnet, onOpen)
  }

  public tickers = <E extends Exchange>(args: Tickers<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'tickers', ...args })

  public books = <E extends Exchange>(args: Books<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'books', ...args })

  public trades = <E extends Exchange>(args: Trades<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'trades', ...args })
}

/**
 *
 */
export class ExchangeSocketTestnet extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.testnet, onOpen)
  }

  private getSymbol = <E extends Exchange>(exchange: E): ExchangeSymbols<E> => {
    if (exchange === 'binance') {
      return 'BCTUSDT' as any
    } else {
      return 'BTCUSD' as any
    }
  }

  public tickers = <E extends Exchange>(args: TestnetArgs<Tickers<E>>): Promise<Subscription> => {
    return this.subscribe({
      channel: 'tickers',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }

  public books = <E extends Exchange>(args: TestnetArgs<Books<E>>): Promise<Subscription> => {
    return this.subscribe({
      channel: 'books',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }

  public trades = <E extends Exchange>(args: TestnetArgs<Trades<E>>): Promise<Subscription> => {
    return this.subscribe({
      channel: 'trades',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }
}

type Trades<E extends Exchange> = NoChannel<SubScribeArgs<'trades', E>>
type Tickers<E extends Exchange> = NoChannel<SubScribeArgs<'tickers', E>>
type Books<E extends Exchange> = NoChannel<SubScribeArgs<'books', E>>
type NoChannel<T> = Omit<T, 'channel'>
type TestnetArgs<T> = Omit<T, 'symbol'>

interface ActiveSubscription<T extends t.Type<any>> {
  activated: boolean
  snapshotType: t.Type<any>
  dataType: T
  onSnapshot: (data: any) => any
  onData: (data: any) => any
  onSubscriptionEnded?: (datapoits: Array<Datapoint<T>>) => any
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
