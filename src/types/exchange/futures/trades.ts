import * as t from 'io-ts'
import { uuid } from 'io-ts-types'

import { ExchangeSymbols } from '../common/symbols'
import { FuturesTradeReason } from './common'

const CommonFuturesTradeFields = t.intersection([
  t.type({
    tradeTime: t.Integer,
    marketMaker: t.boolean,
    price: t.number,
    quantity: t.Int,
  }),
  t.partial({
    /**
     * Only present for non-perpetual futures
     */
    maturationTime: t.Integer,
  }),
])

const BitmexFuturesTradeFields = t.intersection([
  CommonFuturesTradeFields,
  t.type({
    symbol: ExchangeSymbols.bitmex.futures,
    tradeId: uuid,
    grossValue: t.Integer,
    homeNotional: t.number,
    foreignNotional: t.number,
  }),
])

const KrakenFuturesTradeFields = t.intersection([
  CommonFuturesTradeFields,
  t.type({
    symbol: ExchangeSymbols.kraken.futures,
  }),
  t.partial({
    reason: FuturesTradeReason,
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
