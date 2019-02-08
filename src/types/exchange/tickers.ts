import * as t from 'io-ts'

const CommonExchangeTickerFields = t.type({
  bid: t.number,
  ask: t.number,
  symbol: t.string,
  volume: t.number,
})

const GeminiTickerFields = t.intersection([CommonExchangeTickerFields, t.type({ statCloseTime: t.Integer })])

const BitstampTickerFields = t.intersection([
  CommonExchangeTickerFields,
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
  CommonExchangeTickerFields,
  t.type({
    eventTime: t.Integer,
    open: t.number,
    high: t.number,
    low: t.number,
    lastTradeId: t.Integer,
  }),
])

const BinanceTickerFields = t.intersection([
  CommonExchangeTickerFields,
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
  CommonExchangeTickerFields,
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

export const ExchangeTickersTypes = {
  binance: {
    data: t.refinement(BinanceTickerFields, () => true, 'BinanceTickersDataType'),
    snapshot: t.array(BinanceTickerFields, 'BinanceTickersSnapshotType'),
  },
  bitfinex: {
    data: t.refinement(BitfinexTickerFields, () => true, 'BitfinexTickersDataType'),
    snapshot: t.array(BitfinexTickerFields, 'BitfinexTickersSnapshotType'),
  },
  coinbase: {
    data: t.refinement(CoinbaseTickerFields, () => true, 'CoinbaseTickersDataType'),
    snapshot: t.array(CoinbaseTickerFields, 'CoinbaseTickersSnapshotType'),
  },
  gemini: {
    data: t.refinement(GeminiTickerFields, () => true, 'GeminiTickersDataType'),
    snapshot: t.array(GeminiTickerFields, 'GeminiTickersSnapshotType'),
  },
  bitstamp: {
    data: t.refinement(BitstampTickerFields, () => true, 'BitstampTickersDataType'),
    snapshot: t.array(BitstampTickerFields, 'BitstampTickersSnapshotType'),
  },
}

export const ALL_TICKERS_DATA_TYPES = [
  ExchangeTickersTypes.bitfinex.data,
  ExchangeTickersTypes.coinbase.data,
  ExchangeTickersTypes.binance.data,
  ExchangeTickersTypes.gemini.data,
  ExchangeTickersTypes.bitstamp.data,
]

const ALL_TICKERS_SNAPSHOT_TYPES = [
  ExchangeTickersTypes.bitfinex.snapshot,
  ExchangeTickersTypes.coinbase.snapshot,
  ExchangeTickersTypes.binance.snapshot,
  ExchangeTickersTypes.gemini.snapshot,
  ExchangeTickersTypes.bitstamp.snapshot,
]

export const ALL_EXCHANGE_TICKER_TYPES = [...ALL_TICKERS_SNAPSHOT_TYPES, ...ALL_TICKERS_DATA_TYPES]
