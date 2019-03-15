import * as t from 'io-ts'
import { ExchangeChannel } from '../../../sockets/crypto/common'
import { ExchangeFuturesBooksTypes } from './books'
import { ExchangeFuturesTickersTypes } from './tickers'
import { ExchangeFuturesTradesTypes } from './trades'

export declare namespace ExchangeFuturesTypes {
  export type FuturesSnapshot<C extends ExchangeChannel, E extends FuturesExchange> = t.TypeOf<
    typeof ExchangeFuturesTypes.DataTypes[C][E]['snapshot']
  >

  export type FuturesData<C extends ExchangeChannel, E extends FuturesExchange> = t.TypeOf<
    typeof ExchangeFuturesTypes.DataTypes[C][E]['data']
  >
}

export type FuturesExchange = 'kraken'

export class ExchangeFuturesTypes {
  public static DataTypes = {
    trades: ExchangeFuturesTradesTypes,
    books: ExchangeFuturesBooksTypes,
    tickers: ExchangeFuturesTickersTypes,
  }

  public static Exchange = t.keyof({
    kraken: t.null,
  })

  public static Interval = t.keyof({
    monthly: null,
    quarterly: null,
    perpetual: null,
  })

  public static ALL_EXCHANGE_FUTURES_TYPES = []
}
