import * as t from 'io-ts'

const CommonSpotTickerFields = t.type({
  bid: t.number,
  ask: t.number,
  symbol: t.string,
  volume: t.number,
})

const GeminiSpotTickerFields = t.intersection([CommonSpotTickerFields, t.type({ statCloseTime: t.Integer })])

const BitstampSpotTickerFields = t.intersection([
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

const CoinbaseSpotTickerFields = t.intersection([
  CommonSpotTickerFields,
  t.type({
    eventTime: t.Integer,
    open: t.number,
    high: t.number,
    low: t.number,
    lastTradeId: t.Integer,
  }),
])

const BinanceSpotTickerFields = t.intersection([
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
    weightedAvePrice: t.number,
  }),
])

const BitfinexSpotTickerFields = t.intersection([
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

const KrakenSpotTickerFields = t.intersection([
  CommonSpotTickerFields,
  t.type({
    askSize: t.number,
    bidSize: t.number,
    close: t.number,
    closeQuantity: t.number,
    eventTime: t.Integer,
    high: t.number,
    low: t.number,
    open: t.number,
    statCloseTime: t.number,
    statOpenTime: t.number,
    totalTrades: t.Integer,
    weightedAvePrice: t.number,
  }),
])

export const ExchangeSpotTickersTypes = {
  binance: {
    data: t.refinement(BinanceSpotTickerFields, () => true, 'BinanceSpotTickersDataType'),
    snapshot: t.array(BinanceSpotTickerFields, 'BinanceSpotTickersSnapshotType'),
  },
  bitfinex: {
    data: t.refinement(BitfinexSpotTickerFields, () => true, 'BitfinexSpotTickersDataType'),
    snapshot: t.array(BitfinexSpotTickerFields, 'BitfinexSpotTickersSnapshotType'),
  },
  coinbase: {
    data: t.refinement(CoinbaseSpotTickerFields, () => true, 'CoinbaseSpotTickersDataType'),
    snapshot: t.array(CoinbaseSpotTickerFields, 'CoinbaseSpotTickersSnapshotType'),
  },
  gemini: {
    data: t.refinement(GeminiSpotTickerFields, () => true, 'GeminiSpotTickersDataType'),
    snapshot: t.array(GeminiSpotTickerFields, 'GeminiSpotTickersSnapshotType'),
  },
  bitstamp: {
    data: t.refinement(BitstampSpotTickerFields, () => true, 'BitstampSpotTickersDataType'),
    snapshot: t.array(BitstampSpotTickerFields, 'BitstampSpotTickersSnapshotType'),
  },
  kraken: {
    data: t.refinement(KrakenSpotTickerFields, () => true, 'KrakenSpotTickersDataType'),
    snapshot: t.array(KrakenSpotTickerFields, 'KrakenSpotTickersSnapshotType'),
  },
  bitmex: {
    data: t.type({}),
    snapshot: t.array(t.type({})),
  },
}

export const ALL_SPOT_TICKERS_DATA_TYPES = [
  ExchangeSpotTickersTypes.bitfinex.data,
  ExchangeSpotTickersTypes.coinbase.data,
  ExchangeSpotTickersTypes.binance.data,
  ExchangeSpotTickersTypes.gemini.data,
  ExchangeSpotTickersTypes.bitstamp.data,
  ExchangeSpotTickersTypes.kraken.data,
]
