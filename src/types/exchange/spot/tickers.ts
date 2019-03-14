import * as t from 'io-ts'

const CommonSpotTickerFields = t.type({
  bid: t.number,
  ask: t.number,
  symbol: t.string,
  volume: t.number,
})

const GeminiTickerFields = t.intersection([CommonSpotTickerFields, t.type({ statCloseTime: t.Integer })])

const BitstampTickerFields = t.intersection([
  CommonSpotTickerFields,
  t.type({
    eventTime: t.Integer,
    weightedAvePrice: t.number,
    ask: t.number,
    open: t.number,
    high: t.number,
    low: t.number,
  }),
])

const CoinbaseTickerFields = t.intersection([
  CommonSpotTickerFields,
  t.type({
    eventTime: t.Integer,
    open: t.number,
    high: t.number,
    low: t.number,
    lastTradeId: t.Integer,
  }),
])

const BinanceTickerFields = t.intersection([
  CommonSpotTickerFields,
  t.type({
    askSize: t.number,
    bidSize: t.number,
    close: t.number,
    closeQuantity: t.number,
    eventTime: t.Integer,
    firstTradeId: t.Integer,
    high: t.number,
    lastTradeId: t.Integer,
    low: t.number,
    open: t.number,
    prevClose: t.number,
    priceChange: t.number,
    priceChangePerc: t.number,
    quoteVolume: t.number,
    statCloseTime: t.number,
    statOpenTime: t.number,
    totalTrades: t.Integer,
    weightedAvePrice: t.number,
  }),
])

const BitfinexTickerFields = t.intersection([
  CommonSpotTickerFields,
  t.type({
    eventTime: t.Integer,
    priceChange: t.number,
    priceChangePerc: t.number,
    close: t.number,
    bidSize: t.number,
    askSize: t.number,
    high: t.number,
    low: t.number,
  }),
])

export const ExchangeSpotTickersTypes = {
  binance: {
    data: t.refinement(BinanceTickerFields, () => true, 'BinanceSpotTickersDataType'),
    snapshot: t.array(BinanceTickerFields, 'BinanceSpotTickersSnapshotType'),
  },
  bitfinex: {
    data: t.refinement(BitfinexTickerFields, () => true, 'BitfinexSpotTickersDataType'),
    snapshot: t.array(BitfinexTickerFields, 'BitfinexSpotTickersSnapshotType'),
  },
  coinbase: {
    data: t.refinement(CoinbaseTickerFields, () => true, 'CoinbaseSpotTickersDataType'),
    snapshot: t.array(CoinbaseTickerFields, 'CoinbaseSpotTickersSnapshotType'),
  },
  gemini: {
    data: t.refinement(GeminiTickerFields, () => true, 'GeminiSpotTickersDataType'),
    snapshot: t.array(GeminiTickerFields, 'GeminiSpotTickersSnapshotType'),
  },
  bitstamp: {
    data: t.refinement(BitstampTickerFields, () => true, 'BitstampSpotTickersDataType'),
    snapshot: t.array(BitstampTickerFields, 'BitstampSpotTickersSnapshotType'),
  },
}

export const ALL_SPOT_TICKERS_DATA_TYPES = [
  ExchangeSpotTickersTypes.bitfinex.data,
  ExchangeSpotTickersTypes.coinbase.data,
  ExchangeSpotTickersTypes.binance.data,
  ExchangeSpotTickersTypes.gemini.data,
  ExchangeSpotTickersTypes.bitstamp.data,
]

const ALL_SPOT_TICKERS_SNAPSHOT_TYPES = [
  ExchangeSpotTickersTypes.bitfinex.snapshot,
  ExchangeSpotTickersTypes.coinbase.snapshot,
  ExchangeSpotTickersTypes.binance.snapshot,
  ExchangeSpotTickersTypes.gemini.snapshot,
  ExchangeSpotTickersTypes.bitstamp.snapshot,
]

export const ALL_SPOT_EXCHANGE_TICKER_TYPES = [...ALL_SPOT_TICKERS_SNAPSHOT_TYPES, ...ALL_SPOT_TICKERS_DATA_TYPES]
