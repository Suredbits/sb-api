import * as t from 'io-ts'
import { ExchangeSymbols } from '../common/symbols'

const KrakenFuturesTradeFields = t.type({
  ask: t.number,
  askSize: t.number,
  bid: t.number,
  bidSize: t.number,
  close: t.number,
  closeQuantity: t.number,
  eventTime: t.Integer,
  high: t.number,
  low: t.number,
  open: t.number,
  statCloseTime: t.Integer,
  statOpenTime: t.Integer,
  symbol: ExchangeSymbols.kraken.futures,
  totalTrades: t.Integer,
  volume: t.number,
  weightedAvePrice: t.number,
})

export const ExchangeFuturesTradesTypes = {
  kraken: {
    data: t.refinement(KrakenFuturesTradeFields, () => true, 'KrakenFuturesTradesDataType'),
    snapshot: t.array(KrakenFuturesTradeFields, 'KrakenFuturesTradesSnapshotType'),
  },
}

export const ALL_FUTURES_TRADES_DATA_TYPES = [ExchangeFuturesTradesTypes.kraken.data]
