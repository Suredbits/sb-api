import * as t from 'io-ts'
import { ExchangeSymbols } from '../common/symbols'

const CommonSpotBookFields = t.type({
  price: t.number,
})

const GeminiSpotBookFields = t.intersection([
  CommonSpotBookFields,
  t.type({
    eventTime: t.Integer,
    quantityChange: t.number,
    quantityTotal: t.number,
  }),
])

const CoinbaseSpotBookFields = t.intersection([
  CommonSpotBookFields,
  t.type({ symbol: ExchangeSymbols.coinbase, quantityTotal: t.number }),
])

const BitfinexSpotBookFields = t.intersection([
  CommonSpotBookFields,
  t.type({
    eventTime: t.number, // this could be parsed into Date?
    orderId: t.number,
    quantityTotal: t.number,
  }),
])

const BitstampSpotBookFields = t.intersection([
  CommonSpotBookFields,
  t.type({
    eventTime: t.Integer,
    orderId: t.Integer,
    quantityChange: t.number,
  }),
])

const BinanceSpotBookFields = t.intersection([
  CommonSpotBookFields,
  t.type({
    eventTime: t.Integer,
    quantityTotal: t.number,
    symbol: ExchangeSymbols.binance,
  }),
])

const KrakenSpotBookFields = (t.never as any) as t.Type<any>

export const ExchangeSpotBooksTypes = {
  bitfinex: {
    data: t.refinement(BitfinexSpotBookFields, () => true, 'BitfinexSpotBooksDataType'),
    snapshot: t.array(BitfinexSpotBookFields, 'BitfinexSpotBooksSnapshotType'),
  },
  binance: {
    data: t.refinement(BinanceSpotBookFields, () => true, 'BinanceSpotBooksDataType'),
    snapshot: t.array(BinanceSpotBookFields, 'BinanceSpotBooksSnapshotType'),
  },
  coinbase: {
    data: t.refinement(CoinbaseSpotBookFields, () => true, 'CoinbaseSpotBooksDataType'),
    snapshot: t.array(CoinbaseSpotBookFields, 'CoinbaseSpotBooksSnapshotType'),
  },
  gemini: {
    data: t.refinement(GeminiSpotBookFields, () => true, 'GeminiSpotBooksDataType'),
    snapshot: t.array(GeminiSpotBookFields, 'GeminiSpotBooksSnapshotType'),
  },
  bitstamp: {
    data: t.refinement(BitstampSpotBookFields, () => true, 'BitstampSpotBookDataType'),
    snapshot: t.array(BitstampSpotBookFields, 'BitstampSpotBookSnapshotType'),
  },
  kraken: {
    data: t.refinement(KrakenSpotBookFields, () => true, 'KrakenSpotBooksDataType'),
    snapshot: t.array(KrakenSpotBookFields, 'KrakenSpotBooksSnapshotType'),
  },
}

export const ALL_SPOT_BOOKS_DATA_TYPES = [
  ExchangeSpotBooksTypes.bitfinex.data,
  ExchangeSpotBooksTypes.coinbase.data,
  ExchangeSpotBooksTypes.binance.data,
  ExchangeSpotBooksTypes.gemini.data,
  ExchangeSpotBooksTypes.bitstamp.data,
  ExchangeSpotBooksTypes.kraken.data,
]
