import * as t from 'io-ts'

import { ExchangeSymbols } from './symbols'

const CommonExchangeTradeFields = t.type({
  tradeId: t.number,
  price: t.number,
  quantity: t.number,
})

const CoinbaseTradeFields = t.intersection([
  CommonExchangeTradeFields,
  t.type({
    symbol: t.string,
    buyerId: t.string,
    sellerId: t.string,
    tradeTime: t.Integer,
    marketMaker: t.boolean,
  }),
])

const BinanceTradeFields = t.intersection([
  CommonExchangeTradeFields,
  t.type({
    eventTime: t.Integer,
    buyerId: t.string,
    sellerId: t.string,
    tradeTime: t.Integer,
    marketMaker: t.boolean,
  }),
])

const BitfinexTradeFields = t.intersection([
  CommonExchangeTradeFields,
  t.type({
    eventTime: t.Integer,
  }),
])

const GeminiTradeFields = t.intersection([
  CommonExchangeTradeFields,
  t.type({
    tradeTime: t.Integer,
    marketMaker: t.boolean,
  }),
])

const BitstampTradeFields = t.intersection([
  CommonExchangeTradeFields,
  t.type({
    buyerId: t.string,
    sellerId: t.string,
    marketMaker: t.boolean,
  }),
])

export const ExchangeTradesTypes = {
  bitfinex: {
    data: t.refinement(BitfinexTradeFields, () => true, 'BitfinexTradesDataType'),
    snapshot: t.array(BitfinexTradeFields, 'BitfinexTradesSnapshotType'),
  },
  coinbase: {
    data: t.refinement(CoinbaseTradeFields, () => true, 'CoinbaseTradesDataType'),
    snapshot: t.array(CoinbaseTradeFields, 'CoinbaseTradesSnapshotType'),
  },
  binance: {
    data: t.refinement(BinanceTradeFields, () => true, 'BinanceTradesDataType'),
    snapshot: t.array(BinanceTradeFields, 'BinanceTradesSnapshotType'),
  },
  gemini: {
    data: t.refinement(GeminiTradeFields, () => true, 'GeminiTradesDataType'),
    snapshot: t.array(GeminiTradeFields, 'GeminiTradesSnapshotType'),
  },
  bitstamp: {
    data: t.refinement(BitstampTradeFields, () => true, 'BitstampTradesDataType'),
    snapshot: t.array(BitstampTradeFields, 'BitstampTradesSnapshotType'),
  },
}

export const ALL_TRADES_DATA_TYPES = [
  ExchangeTradesTypes.bitfinex.data,
  ExchangeTradesTypes.binance.data,
  ExchangeTradesTypes.coinbase.data,
  ExchangeTradesTypes.gemini.data,
  ExchangeTradesTypes.bitstamp.data,
]

const ALL_TRADES_SNAPSHOT_TYPES = [
  ExchangeTradesTypes.bitfinex.snapshot,
  ExchangeTradesTypes.binance.snapshot,
  ExchangeTradesTypes.coinbase.snapshot,
  ExchangeTradesTypes.bitstamp.snapshot,
  ExchangeTradesTypes.gemini.snapshot,
]

export const ALL_EXCHANGE_TRADES_TYPES = [...ALL_TRADES_DATA_TYPES, ...ALL_TRADES_SNAPSHOT_TYPES]
