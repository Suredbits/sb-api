import * as t from 'io-ts'
import { ExchangeChannel as ExchangeSpotChannel } from '../../../sockets/crypto/spot'
import { ALL_SPOT_EXCHANGE_BOOKS_TYPES, ExchangeSpotBooksTypes } from './books'
import { ALL_SPOT_EXCHANGE_TICKER_TYPES, ExchangeSpotTickersTypes } from './tickers'
import { ALL_SPOT_EXCHANGE_TRADES_TYPES, ExchangeSpotTradesTypes } from './trades'

export declare namespace ExchangeSpotTypes {
  export type SpotSnapshot<C extends ExchangeSpotChannel<E>, E extends SpotExchange> = t.TypeOf<
    typeof ExchangeSpotTypes.DataTypes[C][E]['snapshot']
  >

  export type Data<C extends ExchangeSpotChannel<E>, E extends SpotExchange> = t.TypeOf<
    typeof ExchangeSpotTypes.DataTypes[C][E]['data']
  >
}

export type SpotExchange = t.TypeOf<typeof ExchangeSpotTypes.Exchange>

export class ExchangeSpotTypes {
  public static DataTypes = {
    trades: ExchangeSpotTradesTypes,
    books: ExchangeSpotBooksTypes,
    tickers: ExchangeSpotTickersTypes,
  }

  public static Exchange = t.keyof({
    coinbase: t.null,
    binance: t.null,
    bitfinex: t.null,
    gemini: t.null,
    bitstamp: t.null,
  })

  public static ALL_EXCHANGE_SPOT_TYPES = [
    ...ALL_SPOT_EXCHANGE_BOOKS_TYPES,
    ...ALL_SPOT_EXCHANGE_TICKER_TYPES,
    ...ALL_SPOT_EXCHANGE_TRADES_TYPES,
  ]
}
