import makeDebug from 'debug'
import * as t from 'io-ts'
import WebSocket from 'ws'

import { BitcoinNetwork, LightningApi } from '../../lightning'
import { MessageTypes, SocketValidate } from '../../types'
import { ExchangeSymbols } from '../../types/exchange/common/symbols'
import { FuturesExchange } from '../../types/exchange/futures'
import { SpotExchange } from '../../types/exchange/spot'
import { Omit } from '../../types/util'
import { UUID } from '../../uuid'
import { API, AtleastUUID, OnWsOpen, SbWebSocket } from '../common'

const debug = makeDebug('sb-api:socket:exchange')

export type CryptoAPI = 'futures' | 'spot'

export type Exchange = SpotExchange | FuturesExchange

export type ExchangeChannel = 'tickers' | 'trades' | 'books'

export type NoChannel<T> = Omit<T, 'channel'>

export type TestnetArgs<T> = Omit<T, 'symbol'>

export interface Subscription {
  refill: (addedDuration: number) => Promise<any> // TODO fix me
  unsubscribe: () => Promise<any> // TODO fix me
}

/**
 * Common interface for spot and futures
 * subscription arguments
 */
export interface BaseSubscribeArgs<E extends Exchange, C extends ExchangeChannel> {
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
   * Which trading symbol (currency pair) to
   * subscribe to
   */
  symbol: any

  /**
   *
   * Which exchange to subscribe to
   */
  exchange: E

  /**
   * Which channel to subscribe to
   */
  channel: C

  /**
   * Callback that gets executed when a subscription is ended.
   * The argument that gets passed into this function is a list
   * of all previously collected data points.
   */
  onSubscriptionEnded?: (datapoint: any[]) => any

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
  onSnapshot: (snapshot: any) => any

  /**
   * Callback that gets executed when a data point is received.
   */
  onData: (data: any) => any
}

export abstract class ExchangeSocketBase extends SbWebSocket {
  constructor(protected ln: LightningApi, network: BitcoinNetwork, cryptoApi: CryptoAPI, onOpen: OnWsOpen) {
    super(cryptoApi === 'futures' ? API.futures : API.spot, ln, onOpen, network)
  }

  /**
   * CB that gets invoked when a refill request is being made
   */
  private handleRefill = async (addedDuration: number, uuid: string): Promise<any> => {
    const msg = { uuid, addedDuration, event: 'refill' }
    debug(`Refilling subscription with UUID ${uuid}`)
    debug('Sending %O', msg)
    this.ws.send(JSON.stringify(msg))
  }

  /**
   * CB that gets invoked when a unsubscribe request is being made
   */
  private handleUnsubscribe = async (uuid: string): Promise<any> => {
    const msg = { uuid, event: 'unsubscribe' }
    debug(`Sending unsubscription request with UUID ${uuid}`)
    debug('Sending %O', msg)
    this.ws.send(JSON.stringify(msg))
  }

  /**
   * CB that gets invoked when a new message is received
   * over the WS
   */
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
          const validated = SocketValidate.snapshot(wsData, sub.snapshotType, this.onSnapshotValidationError)
          const { onSnapshot } = sub
          onSnapshot(validated.snapshot)
        } else if (MessageTypes.isExchangeDataResponse(parsed, sub.dataType)) {
          const { data } = parsed
          debug(`Received data for ${uuid}`)
          debug('Data: %O', data)
          const validated = SocketValidate.data(wsData, sub.dataType, this.onDataValidationError)
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

  /**
   * Adds a received data point from the API to the list of data points
   * that is passed into the final callback
   */
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

  protected abstract getTypes(
    channel: ExchangeChannel,
    exchange: Exchange
  ): { data: t.Type<any>; snapshot: t.Type<any> }

  /**
   * Should throw if the given exchange does not support the given channel
   */
  protected abstract checkChannelAndExchange(channel: ExchangeChannel, exchange: Exchange): void

  protected subscribe = async <E extends Exchange, C extends ExchangeChannel, SubArgs extends BaseSubscribeArgs<E, C>>({
    symbol,
    refundInvoice,
    channel,
    exchange,
    onData,
    onSnapshot,
    onSubscriptionEnded,
    duration,
    ...rest
  }: SubArgs): Promise<Subscription> => {
    debug(`Subscribing to ${exchange} ${symbol} ${channel}`)
    this.checkChannelAndExchange(channel, exchange)
    debug('Checked sub validity')

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
      ...rest,
    }
    this.ws.send(JSON.stringify(req))
    debug(`Sending subscription request with UUID ${req.uuid}`)
    debug('Request: %O', req)
    debug(`URL: ${this.url}`)

    return new Promise<Subscription>(resolve => {
      const types = this.getTypes(channel, exchange)

      this.subscriptions[req.uuid] = {
        activated: false,
        snapshotType: types.snapshot,
        dataType: types.data,
        onSnapshot,
        onData,
        onSubscriptionEnded: onSubscriptionEnded as any, // don't know why this is needed
        datapoints: [],
        refundInvoice: req.refundInvoice,
      }

      const subscription: Subscription = {
        refill: addedDuration => this.handleRefill(addedDuration, req.uuid),
        unsubscribe: () => this.handleUnsubscribe(req.uuid),
      }

      resolve(subscription)
    })
  }

  private subscriptions: {
    [uuid: string]: ActiveSubscription<t.Any> | undefined
  } = {}
}

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
   * Epoch time
   */
  timestamp: number
}
