import { BitcoinNetwork, LightningApi } from '../../lightning'
import { FuturesExchangeSymbols } from '../../types/exchange/common/symbols'
import { ExchangeFuturesTypes, FuturesExchange } from '../../types/exchange/futures'
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

export type MaturationInterval = 'monthly' | 'quarterly' | 'perpetual'

export interface FuturesSubscribeArgs<E extends FuturesExchange, C extends ExchangeChannel>
  extends BaseSubscribeArgs<E, C> {
  /**
   * The maturation interval of the futures market you're requesting data about
   *
   * Defaults to __perpetual__.
   */
  interval?: MaturationInterval

  symbol: FuturesExchangeSymbols<E>

  onSnapshot: (snapshot: ExchangeFuturesTypes.FuturesSnapshot<C, E>) => any

  onData: (data: ExchangeFuturesTypes.FuturesData<C, E>) => any

  onSubscriptionEnded?: (datapoint: Array<ExchangeFuturesTypes.FuturesData<C, E>>) => any
}

export class ExchangeFuturesSocket extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.mainnet, API.futures, onOpen)
  }

  protected checkChannelAndExchange = (channel: ExchangeChannel, exchange: Exchange) => {
    if (channel === 'books' && exchange === 'kraken') {
      throw TypeError('Suredbits does not support Kraken books')
    }
  }

  protected getTypes = (channel: ExchangeChannel, exchange: FuturesExchange) =>
    ExchangeFuturesTypes.DataTypes[channel][exchange]

  public tickers = <E extends FuturesExchange>(args: Tickers<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'tickers', ...args })

  public books = <E extends FuturesExchange>(args: Books<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'books', ...args })

  public trades = <E extends FuturesExchange>(args: Trades<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'trades', ...args })
}

export class ExchangeFuturesSocketTestnet extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.testnet, API.futures, onOpen)
  }

  protected checkChannelAndExchange = (channel: ExchangeChannel, exchange: Exchange) => {
    if (channel === 'books' && exchange === 'kraken') {
      throw TypeError('Suredbits does not support Kraken books')
    }
  }

  private doesExchangeSupportFutures = (exchange: Exchange): exchange is FuturesExchange => exchange === 'kraken'

  protected getTypes = (channel: ExchangeChannel, exchange: FuturesExchange) => {
    if (this.doesExchangeSupportFutures(exchange)) {
      return ExchangeFuturesTypes.DataTypes[channel][exchange]
    } else {
      throw TypeError(`${exchange} does not have a futures market!`)
    }
  }

  private getSymbol = <E extends FuturesExchange>(exchange: E): FuturesExchangeSymbols<E> => {
    if (exchange === 'binance') {
      return 'BCTUSDT' as any
    } else {
      return 'BTCUSD' as any
    }
  }

  public tickers = <E extends FuturesExchange>(args: TestnetArgs<Tickers<E>>): Promise<Subscription> => {
    return this.subscribe<E, 'tickers', FuturesSubscribeArgs<E, 'tickers'>>({
      channel: 'tickers',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }

  public books = <E extends FuturesExchange>(args: TestnetArgs<Books<E>>): Promise<Subscription> => {
    return this.subscribe<E, 'books', FuturesSubscribeArgs<E, 'books'>>({
      channel: 'books',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }

  public trades = <E extends FuturesExchange>(args: TestnetArgs<Trades<E>>): Promise<Subscription> => {
    return this.subscribe<E, 'trades', FuturesSubscribeArgs<E, 'trades'>>({
      channel: 'trades',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }
}

type Trades<E extends FuturesExchange> = NoChannel<FuturesSubscribeArgs<E, 'trades'>>
type Tickers<E extends FuturesExchange> = NoChannel<FuturesSubscribeArgs<E, 'tickers'>>
type Books<E extends FuturesExchange> = NoChannel<FuturesSubscribeArgs<E, 'books'>>
