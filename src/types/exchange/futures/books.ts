import * as t from 'io-ts'
import { ExchangeSymbols } from '../common/symbols'

/**
 * Kraken does not support books
 */
const KrakenFuturesBookFields = t.intersection([
  t.type({
    eventTime: t.Int,
    symbol: ExchangeSymbols.kraken.futures,
    price: t.number,
    quantityTotal: t.number,
  }),
  t.partial({
    maturation: t.Integer,
  }),
])

const BitmexFuturesBookFields = t.intersection([
  t.type({
    symbol: ExchangeSymbols.bitmex.futures,
    orderId: t.Integer,
    quantityChange: t.number,
  }),
  t.partial({
    maturation: t.Integer,
    price: t.number,
  }),
])

export const ExchangeFuturesBooksTypes = {
  kraken: {
    data: t.refinement(KrakenFuturesBookFields, () => true, 'KrakenFuturesBooksDataType'),
    snapshot: t.array(KrakenFuturesBookFields, 'KrakenFuturesBooksDataType'),
  },
  bitmex: {
    data: t.refinement(BitmexFuturesBookFields, () => true, 'BitmexFuturesBooksDatatype'),
    snapshot: t.array(BitmexFuturesBookFields, 'BitmexFuturesBooksSnapshot'),
  },
}

export const ALL_FUTURES_BOOKS_DATA_TYPES = [
  ExchangeFuturesBooksTypes.kraken.data,
  ExchangeFuturesBooksTypes.bitmex.data,
]
