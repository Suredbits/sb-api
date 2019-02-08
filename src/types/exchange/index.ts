import * as t from 'io-ts'
import { ALL_EXCHANGE_BOOKS_TYPES, ExchangeBooksTypes } from './books'
import { ALL_EXCHANGE_TICKER_TYPES, ExchangeTickersTypes } from './tickers'
import { ALL_EXCHANGE_TRADES_TYPES, ExchangeTradesTypes } from './trades'

export type Exchange = t.TypeOf<typeof ExchangeTypes.Exchange>

export class ExchangeTypes {
  public static DataTypes = {
    trades: ExchangeTradesTypes,
    books: ExchangeBooksTypes,
    tickers: ExchangeTickersTypes,
  }

  public static Exchange = t.keyof({
    coinbase: t.null,
    binance: t.null,
    bitfinex: t.null,
    gemini: t.null,
    bitstamp: t.null,
  })

  public static ALL_EXCHANGE_TYPES = [
    ...ALL_EXCHANGE_BOOKS_TYPES,
    ...ALL_EXCHANGE_TICKER_TYPES,
    ...ALL_EXCHANGE_TRADES_TYPES,
  ]
}
