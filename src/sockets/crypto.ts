import * as t from 'io-ts'
import genUuid from 'uuid'
import WebSocket from 'ws'

import { API } from '.'
import { BitcoinNetwork, LightningApi } from '../lightning'
import { Logger } from '../logging'
import { MessageTypes, validateDataMessage, validateSnapshotMessage } from '../types'
import { Exchange, ExchangeTypes } from '../types/exchange'
import { ExchangeSymbols } from '../types/exchange/symbols'
import { Omit } from '../types/util'
import { OnWsOpen, SbWebSocket } from './common'

export type ExchangeChannel = 'tickers' | 'trades' | 'books'

interface SubScribeArgs<C extends ExchangeChannel, E extends Exchange> {
  exchange: E
  symbol: ExchangeSymbols<E>
  channel: C
  duration: number
  refundInvoice: string
  onSnapshot: (snapshot: any) => any // TODO fix me
  onData: (data: any) => any // TODO fix me
  onSubscriptionEnded: (datapoint: any[]) => any // TODO fix me
}

interface Subscription {
  refill: (addedDuration: number) => Promise<any> // TODO fix me
  unsubscribe: () => Promise<any> // TODO fix me
}

export class ExchangeSocket extends SbWebSocket {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(API.crypto, ln, onOpen, BitcoinNetwork.mainnet)
  }

  public tickers = <E extends Exchange>(args: Omit<SubScribeArgs<'tickers', E>, 'channel'>): Subscription =>
    this.subscribe({ channel: 'tickers', ...args })

  public books = <E extends Exchange>(args: Omit<SubScribeArgs<'books', E>, 'channel'>): Subscription =>
    this.subscribe({ channel: 'tickers', ...args })

  public trades = <E extends Exchange>(args: Omit<SubScribeArgs<'trades', E>, 'channel'>): Subscription =>
    this.subscribe({ channel: 'tickers', ...args })

  private handleRefill = async (addedDuration: number, uuid: string): Promise<any> => {
    const msg = { uuid, addedDuration, event: 'refill' }
    Logger.info(`Refilling subscription with UUID ${uuid}`)
    Logger.debug('Sending %O', msg)
    this.ws.send(JSON.stringify(msg))
  }

  private handleUnsubscribe = async (uuid: string): Promise<any> => {
    const msg = { uuid, event: 'unsubscribe' }
    Logger.info(`Sending unsubscription request with UUID ${uuid}`)
    Logger.debug('Sending %O', msg)
    this.ws.send(JSON.stringify(msg))
  }

  public handleMessage = async (uuid: string, parsed: AtleastUUID, wsData: WebSocket.Data) => {
    Logger.debug('Received message in exchange socket %O', parsed)
    if (MessageTypes.isInvoice(parsed)) {
      Logger.info(`Got invoice for request with UUID ${uuid}`)

      const paymentResult = await this.ln.send(parsed.invoice)
      Logger.debug('Paid invoice: %O', paymentResult)
    } else if (MessageTypes.isPaymentReceived(parsed)) {
      Logger.info(`Payment received for ${parsed.uuid}`)
    } else {
      const sub = this.subscriptions[uuid]
      if (!sub) {
        Logger.error(
          'Got message with UUID for subscription not found in active subscriptions map! UUID: %s. Subscriptions map: %O',
          uuid,
          this.subscriptions
        )
      } else {
        if (MessageTypes.isSnapshot(parsed)) {
          const { snapshot } = parsed
          Logger.info(`Received snapshot for ${uuid} with ${snapshot.length} elements`)
          const newSub: ActiveSubscription<t.Type<any>> = {
            ...sub,
            activated: true,
          }
          this.subscriptions[uuid] = newSub
          const validated = validateSnapshotMessage(wsData, sub.snapshotType, this.onSnapshotValidationError)
          const { onSnapshot } = sub
          onSnapshot(validated.snapshot)
        } else if (MessageTypes.isExchangeDataResponse(parsed, sub.dataType)) {
          const { data } = parsed
          Logger.debug(`Received data for ${uuid}`)
          Logger.debug('Data: %O', data)
          const validated = validateDataMessage(wsData, sub.dataType, this.onDataValidationError)
          this.addDataPoint(uuid, validated.data)
          sub.datapoints = [...sub.datapoints]
          sub.onData(validated.data)
        } else if (MessageTypes.isTimeWarning(parsed)) {
          Logger.info(`Received time warning message for ${uuid}, ${parsed.warnings.duration / 1000} seconds left`)
        } else if (MessageTypes.isUnubscribed(parsed)) {
          Logger.info(`Subscription ${uuid} has ended`)
          sub.onSubscriptionEnded(sub.datapoints)
        } else {
          Logger.error("Don't know what to do with message %O", parsed)
        }
      }
    }
  }

  private addDataPoint = (uuid: string, data: object): void => {
    const sub = this.subscriptions[uuid]
    if (!sub) {
      Logger.error(`Trying to add datapoint to sub ${uuid}, couldn't find sub`)
      return
    }
    sub.datapoints = [...sub.datapoints, data as any]
    Logger.debug(`Added datapoint to sub ${uuid}`)
  }

  private onSnapshotValidationError = (err: any) => {
    Logger.error('Error happened while validating snapshot! %O', err)
    // TODO something else here
  }

  private onDataValidationError = (err: any) => {
    Logger.error('Error happened while validating data! %O', err)
    // TODO something else here
  }

  public subscribe = <C extends ExchangeChannel, E extends Exchange>({
    symbol,
    refundInvoice,
    channel,
    exchange,
    onData,
    onSnapshot,
    onSubscriptionEnded,
    duration,
  }: SubScribeArgs<C, E>): C extends 'books' ? (E extends 'bitfinex' ? Subscription : never) : Subscription => {
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
    Logger.info(`Sending subscription request with UUID ${req.uuid}`)
    Logger.debug('Request: %O', req) // TODO set to debug

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

export class ExchangeSocketTestnet extends ExchangeSocket {
  public tickers = <E extends Exchange>(
    args: Omit<SubScribeArgs<'tickers', E>, 'channel' | 'symbol'>
  ): Subscription => {
    const symbol = args.exchange === 'binance' ? 'BTCUSDT' : 'BTCUSD'
    return this.subscribe({
      channel: 'tickers',
      symbol: symbol as any,
      ...args,
    })
  }

  public books = <E extends Exchange>(args: Omit<SubScribeArgs<'books', E>, 'channel' | 'symbol'>): Subscription => {
    const symbol = args.exchange === 'binance' ? 'BTCUSDT' : 'BTCUSD'
    return this.subscribe({
      channel: 'tickers',
      symbol: symbol as any,
      ...args,
    })
  }

  public trades = <E extends Exchange>(args: Omit<SubScribeArgs<'trades', E>, 'channel' | 'symbol'>): Subscription => {
    const symbol = args.exchange === 'binance' ? 'BTCUSDT' : 'BTCUSD'
    return this.subscribe({
      channel: 'tickers',
      symbol: symbol as any,
      ...args,
    })
  }
}

interface ActiveSubscription<T extends t.Type<any>> {
  activated: boolean
  snapshotType: t.Type<any>
  dataType: T
  onSnapshot: (data: any) => any
  onData: (data: any) => any
  onSubscriptionEnded: (datapoits: Array<Datapoint<T>>) => any
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
