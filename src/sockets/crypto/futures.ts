import * as t from 'io-ts'

import { BitcoinNetwork, LightningApi } from '../../lightning'
import { FuturesExchangeSymbols } from '../../types/exchange/common/symbols'
import { ExchangeFuturesTypes, FuturesExchange } from '../../types/exchange/futures'
import { SpotExchange } from '../../types/exchange/spot'
import { API, OnWsOpen } from '../common'
import {
  BaseSubscribeArgs,
  Exchange,
  ExchangeChannel,
  ExchangeSocketBase,
  NoChannel,
  Subscription,
  TestnetArgs,
} from './common'

export type ExchangeFuturesChannel = 'tickers' | 'trades' | 'books'

export type MaturationInterval = KrakenMaturationInterval | BitmexMaturationInterval
export type MaturationIntervalForExchangeAndSymbol<
  E extends FuturesExchange,
  S extends FuturesExchangeSymbols<E>
> = E extends 'kraken'
  ? KrakenMaturationInterval
  : E extends 'bitmex'
  ? S extends 'BTCUSD'
    ? BitmexMaturationIntervalBTCUSD
    : S extends 'ETHUSD'
    ? BitmexMaturationIntervalETHUSD
    : S extends 'ETHBTC'
    ? BitmexMaturationIntervalETHBTC
    : never
  : never

export const KrakenMaturationInterval = t.keyof({ monthly: t.null, quarterly: t.null, perpetual: t.null })
export type KrakenMaturationInterval = t.TypeOf<typeof KrakenMaturationInterval>

export const BitmexMaturationIntervalBTCUSD = t.keyof({ quarterly: t.null, perpetual: t.null, biquarterly: t.null })
export type BitmexMaturationIntervalBTCUSD = t.TypeOf<typeof BitmexMaturationIntervalBTCUSD>

export const BitmexMaturationIntervalETHUSD = t.keyof({ perpetual: t.null })
export type BitmexMaturationIntervalETHUSD = t.TypeOf<typeof BitmexMaturationIntervalETHUSD>

export const BitmexMaturationIntervalETHBTC = t.keyof({ monthly: t.null })
export type BitmexMaturationIntervalETHBTC = t.TypeOf<typeof BitmexMaturationIntervalETHBTC>

export type BitmexMaturationInterval =
  | BitmexMaturationIntervalBTCUSD
  | BitmexMaturationIntervalETHBTC
  | BitmexMaturationIntervalETHUSD

export interface FuturesSubscribeArgs<
  E extends FuturesExchange,
  C extends ExchangeChannel,
  S extends FuturesExchangeSymbols<E>
> extends BaseSubscribeArgs<E, C> {
  /**
   * The maturation interval of the futures market you're requesting data about
   *
   * Defaults to __perpetual__.
   */
  interval?: MaturationIntervalForExchangeAndSymbol<E, S>

  symbol: S

  onSnapshot: (snapshot: ExchangeFuturesTypes.FuturesSnapshot<C, E>) => any

  onData: (data: ExchangeFuturesTypes.FuturesData<C, E>) => any

  onSubscriptionEnded?: (datapoint: Array<ExchangeFuturesTypes.FuturesData<C, E>>) => any
}

export class ExchangeFuturesSocket extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.mainnet, API.futures, onOpen)
  }

  protected checkChannelAndExchange = (channel: ExchangeChannel, exchange: Exchange) => {
    return
  }

  protected getTypes = (channel: ExchangeChannel, exchange: FuturesExchange) =>
    ExchangeFuturesTypes.DataTypes[channel][exchange]

  public tickers = <E extends FuturesExchange, S extends FuturesExchangeSymbols<E>>(
    args: Tickers<E, S>
  ): Promise<Subscription> => this.subscribe({ channel: 'tickers', ...args })

  public books = <E extends FuturesExchange, S extends FuturesExchangeSymbols<E>>(
    args: Books<E, S>
  ): Promise<Subscription> => this.subscribe({ channel: 'books', ...args })

  public trades = <E extends FuturesExchange, S extends FuturesExchangeSymbols<E>>(
    args: Trades<E, S>
  ): Promise<Subscription> => this.subscribe({ channel: 'trades', ...args })
}

export class ExchangeFuturesSocketTestnet extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.testnet, API.futures, onOpen)
  }

  protected checkChannelAndExchange = (channel: ExchangeChannel, exchange: Exchange) => {
    return
  }

  private doesExchangeSupportFutures = (exchange: Exchange): exchange is FuturesExchange => exchange === 'kraken'

  protected getTypes = (channel: ExchangeChannel, exchange: FuturesExchange) => {
    if (this.doesExchangeSupportFutures(exchange)) {
      return ExchangeFuturesTypes.DataTypes[channel][exchange]
    } else {
      throw TypeError(`${exchange} does not have a futures market!`)
    }
  }

  public tickers = <E extends FuturesExchange>(args: TestnetArgs<Tickers<E, any>>): Promise<Subscription> => {
    return this.subscribe<E, 'tickers', FuturesSubscribeArgs<E, 'tickers', any>>({
      channel: 'tickers',
      symbol: 'BTCUSD',
      ...args,
    })
  }

  public books = <E extends FuturesExchange>(args: TestnetArgs<Books<E, any>>): Promise<Subscription> => {
    return this.subscribe<E, 'books', FuturesSubscribeArgs<E, 'books', any>>({
      channel: 'books',
      symbol: 'BTCUSD',
      ...args,
    })
  }

  public trades = <E extends FuturesExchange>(args: TestnetArgs<Trades<E, any>>): Promise<Subscription> => {
    return this.subscribe<E, 'trades', FuturesSubscribeArgs<E, 'trades', any>>({
      channel: 'trades',
      symbol: 'BTCUSD',
      ...args,
    })
  }
}

type Trades<E extends FuturesExchange, S extends FuturesExchangeSymbols<E>> = NoChannel<
  FuturesSubscribeArgs<E, 'trades', S>
>
type Tickers<E extends FuturesExchange, S extends FuturesExchangeSymbols<E>> = NoChannel<
  FuturesSubscribeArgs<E, 'tickers', S>
>
type Books<E extends FuturesExchange, S extends FuturesExchangeSymbols<E>> = NoChannel<
  FuturesSubscribeArgs<E, 'books', S>
>
