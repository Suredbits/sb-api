import * as t from 'io-ts'

const CommonSpotExchangeTradeFields = t.type({
  tradeId: t.number,
  price: t.number,
  quantity: t.number,
})

const CoinbaseSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    symbol: t.string,
    buyerId: t.string,
    sellerId: t.string,
    tradeTime: t.Integer,
    marketMaker: t.boolean,
  }),
])

const BinanceSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    eventTime: t.Integer,
    buyerId: t.string,
    sellerId: t.string,
    tradeTime: t.Integer,
    marketMaker: t.boolean,
  }),
])

const BitfinexSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    eventTime: t.Integer,
  }),
])

const GeminiSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    tradeTime: t.Integer,
    marketMaker: t.boolean,
  }),
])

const BitstampSpotTradeFields = t.intersection([
  CommonSpotExchangeTradeFields,
  t.type({
    buyerId: t.string,
    sellerId: t.string,
    marketMaker: t.boolean,
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
}

export const ALL_SPOT_TRADES_DATA_TYPES = [
  ExchangeSpotTradesTypes.bitfinex.data,
  ExchangeSpotTradesTypes.binance.data,
  ExchangeSpotTradesTypes.coinbase.data,
  ExchangeSpotTradesTypes.gemini.data,
  ExchangeSpotTradesTypes.bitstamp.data,
]

const ALL_SPOT_TRADES_SNAPSHOT_TYPES = [
  ExchangeSpotTradesTypes.bitfinex.snapshot,
  ExchangeSpotTradesTypes.binance.snapshot,
  ExchangeSpotTradesTypes.coinbase.snapshot,
  ExchangeSpotTradesTypes.bitstamp.snapshot,
  ExchangeSpotTradesTypes.gemini.snapshot,
]

export const ALL_SPOT_EXCHANGE_TRADES_TYPES = [...ALL_SPOT_TRADES_DATA_TYPES, ...ALL_SPOT_TRADES_SNAPSHOT_TYPES]
