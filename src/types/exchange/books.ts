import * as t from 'io-ts'
import { ExchangeSymbols } from './symbols'

const CommonBookFields = t.type({
  price: t.number,
})

const GeminiBookFields = t.intersection([
  CommonBookFields,
  t.type({
    eventTime: t.Integer,
    quantityChange: t.number,
    quantityTotal: t.number,
  }),
])

const CoinbaseBookFields = t.intersection([
  CommonBookFields,
  t.type({ symbol: ExchangeSymbols.coinbase, quantityTotal: t.number }),
])

const BitfinexBookFields = t.intersection([
  CommonBookFields,
  t.type({
    eventTime: t.number, // this could be parsed into Date?
    orderId: t.number,
    quantityTotal: t.number,
  }),
])

const BitstampBookFields = t.intersection([
  CommonBookFields,
  t.type({
    eventTime: t.Integer,
    orderId: t.Integer,
    quantityChange: t.number,
  }),
])

const BinanceBookFields = (t.never as any) as t.Type<any>

export const ExchangeBooksTypes = {
  bitfinex: {
    data: t.refinement(BitfinexBookFields, () => true, 'BitfinexBooksDataType'),
    snapshot: t.array(BitfinexBookFields, 'BitfinexBooksSnapshotType'),
  },
  binance: {
    data: t.refinement(BinanceBookFields, () => true, 'BinanceBooksDataType'),
    snapshot: t.array(BinanceBookFields, 'BinanceBooksSnapshotType'),
  },
  coinbase: {
    data: t.refinement(CoinbaseBookFields, () => true, 'CoinbaseBooksDataType'),
    snapshot: t.array(CoinbaseBookFields, 'CoinbaseBooksSnapshotType'),
  },
  gemini: {
    data: t.refinement(GeminiBookFields, () => true, 'GeminiBooksDataType'),
    snapshot: t.array(GeminiBookFields, 'GeminiBooksSnapshotType'),
  },
  bitstamp: {
    data: t.refinement(BitstampBookFields, () => true, 'BitstampBookDataType'),
    snapshot: t.array(BitstampBookFields, 'BitstampBookSnapshotType'),
  },
}

export const ALL_BOOKS_DATA_TYPES = [
  ExchangeBooksTypes.bitfinex.data,
  ExchangeBooksTypes.coinbase.data,
  ExchangeBooksTypes.binance.data,
  ExchangeBooksTypes.gemini.data,
  ExchangeBooksTypes.bitstamp.data,
]

const ALL_TICKERS_SNAPSHOT_TYPES = [
  ExchangeBooksTypes.bitfinex.snapshot,
  ExchangeBooksTypes.coinbase.snapshot,
  ExchangeBooksTypes.binance.snapshot,
  ExchangeBooksTypes.gemini.snapshot,
  ExchangeBooksTypes.bitstamp.snapshot,
]

export const ALL_EXCHANGE_BOOKS_TYPES = [...ALL_TICKERS_SNAPSHOT_TYPES, ...ALL_BOOKS_DATA_TYPES]
