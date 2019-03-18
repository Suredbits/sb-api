import * as t from 'io-ts'

import { ExchangeChannel } from '../../../sockets/crypto/common'
import { ExchangeSpotBooksTypes } from './books'
import { ExchangeSpotTickersTypes } from './tickers'
import { ExchangeSpotTradesTypes } from './trades'

export declare namespace ExchangeSpotTypes {
  export type SpotSnapshot<C extends ExchangeChannel, E extends SpotExchange> = t.TypeOf<
    typeof ExchangeSpotTypes.DataTypes[C][E]['snapshot']
  >

  export type SpotData<C extends ExchangeChannel, E extends SpotExchange> = t.TypeOf<
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
    kraken: t.null,
  })
}
