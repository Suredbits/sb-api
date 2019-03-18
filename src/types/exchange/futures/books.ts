import * as t from 'io-ts'
import { ExchangeSymbols } from '../common/symbols'

const CommonBookFields = t.intersection([
  t.type({}),
  t.partial({
    price: t.number,

    /**
     * Only present if subscribing to perpetual futures
     */
    maturation: t.Integer,
  }),
])

const KrakenFuturesBookFields = t.intersection([
  CommonBookFields,
  t.type({
    eventTime: t.Integer,
    symbol: ExchangeSymbols.kraken.futures,
    quantityTotal: t.number,
  }),
])

const BitmexFuturesBookFields = t.intersection([
  CommonBookFields,
  t.type({
    symbol: ExchangeSymbols.bitmex.futures,
    orderId: t.Integer,
    quantityChange: t.number,
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
