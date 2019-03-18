import * as t from 'io-ts'

const CommonSpotExchangeTradeFields = t.type({
  price: t.number,
  quantity: t.number,
})

const CoinbaseSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    buyerId: t.string,
    marketMaker: t.boolean,
    sellerId: t.string,
    symbol: t.string,
    tradeId: t.number,
    tradeTime: t.Integer,
  }),
])

const BinanceSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    buyerId: t.string,
    eventTime: t.Integer,
    marketMaker: t.boolean,
    sellerId: t.string,
    symbol: t.string,
    tradeId: t.number,
    tradeTime: t.Integer,
  }),
])

const BitfinexSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    eventTime: t.Integer,
    tradeId: t.number,
  }),
])

const GeminiSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    marketMaker: t.boolean,
    tradeId: t.number,
    tradeTime: t.Integer,
  }),
])

const BitstampSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    buyerId: t.string,
    marketMaker: t.boolean,
    sellerId: t.string,
    tradeId: t.number,
  }),
])

const KrakenSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    eventTime: t.Integer,
    marketMaker: t.boolean,
    symbol: t.string,
    tradeTime: t.Integer,
  }),
])

export const ExchangeSpotTradesTypes = {
  bitfinex: {
    data: t.refinement(BitfinexSpotTradeFields, () => true, 'BitfinexSpotTradesDataType'),
    snapshot: t.array(BitfinexSpotTradeFields, 'BitfinexSpotTradesSnapshotType'),
  },
  coinbase: {
    data: t.refinement(CoinbaseSpotTradeFields, () => true, 'CoinbaseSpotTradesDataType'),
    snapshot: t.array(CoinbaseSpotTradeFields, 'CoinbaseSpotTradesSnapshotType'),
  },
  binance: {
    data: t.refinement(BinanceSpotTradeFields, () => true, 'BinanceSpotTradesDataType'),
    snapshot: t.array(BinanceSpotTradeFields, 'BinanceSpotTradesSnapshotType'),
  },
  gemini: {
    data: t.refinement(GeminiSpotTradeFields, () => true, 'GeminiSpotTradesDataType'),
    snapshot: t.array(GeminiSpotTradeFields, 'GeminiSpotTradesSnapshotType'),
  },
  bitstamp: {
    data: t.refinement(BitstampSpotTradeFields, () => true, 'BitstampSpotTradesDataType'),
    snapshot: t.array(BitstampSpotTradeFields, 'BitstampSpotTradesSnapshotType'),
  },
  kraken: {
    data: t.refinement(KrakenSpotTradeFields, () => true, 'KrakenSpotTradesDataType'),
    snapshot: t.array(KrakenSpotTradeFields, 'KrakenSpotTradesSnapshotType'),
  },
  bitmex: {
    data: t.type({}),
    snapshot: t.array(t.type({})),
  },
}

export const ALL_SPOT_TRADES_DATA_TYPES = [
  ExchangeSpotTradesTypes.bitfinex.data,
  ExchangeSpotTradesTypes.binance.data,
  ExchangeSpotTradesTypes.coinbase.data,
  ExchangeSpotTradesTypes.gemini.data,
  ExchangeSpotTradesTypes.bitstamp.data,
  ExchangeSpotTradesTypes.kraken.data,
]
