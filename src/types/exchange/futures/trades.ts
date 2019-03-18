import * as t from 'io-ts'
import { uuid } from 'io-ts-types'

import { ExchangeSymbols } from '../common/symbols'
import { FuturesTradeReason } from './common'

const BitmexFuturesTradeFields = t.intersection([
  t.type({
    symbol: ExchangeSymbols.bitmex.futures,
    tradeId: uuid,
    price: t.number,
    quantity: t.Integer,
    grossValue: t.Integer,
    homeNotional: t.number,
    foreignNotional: t.number,
    tradeTime: t.Integer,
    marketMaker: t.boolean,
  }),
  t.partial({
    maturationTime: t.Integer,
  }),
])

const KrakenFuturesTradeFields = t.intersection([
  t.type({
    symbol: ExchangeSymbols.kraken.futures,
    price: t.number,
    quantity: t.Int,
    tradeTime: t.Int,
    marketMaker: t.boolean,
    reason: FuturesTradeReason,
  }),
  t.partial({
    /**
     * Not present if subscribing to perpetual futures
     */
    maturationTime: t.Integer,
  }),
])

export const ExchangeFuturesTradesTypes = {
  kraken: {
    data: t.refinement(KrakenFuturesTradeFields, () => true, 'KrakenFuturesTradesDataType'),
    snapshot: t.array(KrakenFuturesTradeFields, 'KrakenFuturesTradesSnapshotType'),
  },
  bitmex: {
    data: t.refinement(BitmexFuturesTradeFields, () => true, 'BitmexFuturesTradesFields'),
    snapshot: t.array(BitmexFuturesTradeFields, 'BitmexFuturesTradesSnapshot'),
  },
}

export const ALL_FUTURES_TRADES_DATA_TYPES = [
  ExchangeFuturesTradesTypes.kraken.data,
  ExchangeFuturesTradesTypes.bitmex.data,
]
