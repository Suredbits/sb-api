import { BitcoinNetwork, LightningApi } from '../../lightning'
import { SpotExchangeSymbols } from '../../types/exchange/common/symbols'
import { FuturesExchange } from '../../types/exchange/futures'
import { ExchangeSpotTypes, SpotExchange } from '../../types/exchange/spot'
import { API } from '../common'
import { OnWsOpen } from '../common'
import {
  BaseSubscribeArgs,
  Exchange,
  ExchangeChannel,
  ExchangeSocketBase,
  NoChannel,
  Subscription,
  TestnetArgs,
} from './common'

export interface SpotSubscribeArgs<E extends SpotExchange, C extends ExchangeChannel> extends BaseSubscribeArgs<E, C> {
  onSnapshot: (snapshot: ExchangeSpotTypes.SpotSnapshot<C, E>) => any

  onData: (data: ExchangeSpotTypes.SpotData<C, E>) => any

  onSubscriptionEnded?: (datapoint: Array<ExchangeSpotTypes.SpotData<C, E>>) => any
}

export interface FuturesSubscribeArgs<E extends FuturesExchange, C extends ExchangeChannel>
  extends BaseSubscribeArgs<E, C> {}

export class ExchangeSpotSocket extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.mainnet, API.spot, onOpen)
  }
  protected getTypes = (channel: ExchangeChannel, exchange: SpotExchange) =>
    ExchangeSpotTypes.DataTypes[channel][exchange]

  protected checkChannelAndExchange = (channel: ExchangeChannel, exchange: Exchange) => {
    if (channel === 'books' && exchange === 'kraken') {
      throw TypeError('Suredbits does not support Kraken books')
    }
  }

  public tickers = <E extends SpotExchange>(args: Tickers<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'tickers' as any, ...args })

  public books = <E extends SpotExchange>(args: Books<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'books' as any, ...args })

  public trades = <E extends SpotExchange>(args: Trades<E>): Promise<Subscription> =>
    this.subscribe({ channel: 'trades' as any, ...args })
}

export class ExchangeSpotSocketTestnet extends ExchangeSocketBase {
  constructor(protected ln: LightningApi, onOpen: OnWsOpen) {
    super(ln, BitcoinNetwork.testnet, API.spot, onOpen)
  }

  protected checkChannelAndExchange = (channel: ExchangeChannel, exchange: Exchange) => {
    if (channel === 'books' && exchange === 'kraken') {
      throw TypeError('Suredbits does not support Kraken books')
    }
  }

  protected getTypes = (channel: ExchangeChannel, exchange: Exchange) => ExchangeSpotTypes.DataTypes[channel][exchange]

  private getSymbol = <E extends Exchange>(exchange: E): SpotExchangeSymbols<E> => {
    if (exchange === 'binance') {
      return 'BCTUSDT' as any
    } else {
      return 'BTCUSD' as any
    }
  }

  public tickers = <E extends SpotExchange>(args: TestnetArgs<Tickers<E>>): Promise<Subscription> => {
    return this.subscribe<E, 'tickers', SpotSubscribeArgs<E, 'tickers'>>({
      channel: 'tickers',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }

  public books = <E extends SpotExchange>(args: TestnetArgs<Books<E>>): Promise<Subscription> => {
    return this.subscribe<E, 'books', SpotSubscribeArgs<E, 'books'>>({
      channel: 'books',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }

  public trades = <E extends SpotExchange>(args: TestnetArgs<Trades<E>>): Promise<Subscription> => {
    return this.subscribe<E, 'trades', SpotSubscribeArgs<E, 'trades'>>({
      channel: 'trades',
      symbol: this.getSymbol(args.exchange),
      ...args,
    })
  }
}

type Trades<E extends SpotExchange> = NoChannel<SpotSubscribeArgs<E, 'trades'>>
type Tickers<E extends SpotExchange> = NoChannel<SpotSubscribeArgs<E, 'tickers'>>
type Books<E extends SpotExchange> = NoChannel<SpotSubscribeArgs<E, 'books'>>
