import * as t from 'io-ts'
import { ExchangeSymbols } from '../common/symbols'

const KrakenFuturesTickersFields = t.type({
  eventTime: t.Integer,
  symbol: ExchangeSymbols.kraken.futures,
  weightedAvePrice: t.number,
  close: t.number,
  closeQuantity: t.number,
  bid: t.number,
  bidSize: t.number,
  ask: t.number,
  askSize: t.number,
  open: t.number,
  high: t.number,
  low: t.number,
  volume: t.number,
  statOpenTime: t.Integer,
  statCloseTime: t.Integer,
  totalTrades: t.Integer,
})

export const ExchangeFuturesTickersTypes = {
  kraken: {
    data: t.refinement(KrakenFuturesTickersFields, () => true, 'KrakenFuturesTickersDataType'),
    snapshot: t.array(KrakenFuturesTickersFields, 'KrakenFuturesTickersSnapshotType'),
  },
}

export const ALL_FUTURES_TICKERS_DATA_TYPES = [ExchangeFuturesTickersTypes.kraken.data]
