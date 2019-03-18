import * as t from 'io-ts'

import { ExchangeSymbols } from '../common/symbols'
import { MaturationIntervalType } from './common'

const CommonTickersFields = t.type({
  ask: t.number,
  bid: t.number,
  eventTime: t.Integer,
  // fundingRate: t.number,
  // fundingRatePrediction: t.number,
  index: t.number,
  last: t.number,
  leverage: t.string,
  maturationInterval: MaturationIntervalType,
  // maturationTime: t.Int,
  // nextFundingRateTime: t.number,
  openInterest: t.number,
  priceChange: t.number,
})

const KrakenFuturesTickersFields = t.intersection([
  CommonTickersFields,
  t.type({
    askSize: t.number,
    bidSize: t.number,
    premium: t.number,
    // price: t.number,
    // statCloseTime: t.Integer,
    // statOpenTime: t.Integer,
    symbol: ExchangeSymbols.kraken.futures,
    // totalTrades: t.Integer,
    volume: t.number,
    // volWeightedAvePrice: t.number,
    // weightedAvePrice: t.number, // BTCUSD
  }),
  t.partial({
    /**
     * Only present if `maturationInterval` is not `"perpetual"`
     */
    maturationTime: t.Integer,
  }),
])

const BitmexTickersFuturesFields = t.intersection([
  t.type({
    eventTime: t.Integer,
    symbol: ExchangeSymbols.bitmex.futures,
    maturationInterval: MaturationIntervalType,
    bid: t.number,
    ask: t.number,
    markPrice: t.number,
    priceChange: t.number,
    last: t.number,
    low: t.number,
    high: t.number,
    volume: t.Integer,
    volWeightedAvePrice: t.number,
    leverage: t.string, // todo fix me
    index: t.number,
    openInterest: t.Integer,
  }),
  t.partial({
    /**
     * Only present if `maturationInterval` is not `"perpetual"`
     */
    maturationTime: t.Integer,
  }),
])

export const ExchangeFuturesTickersTypes = {
  kraken: {
    data: t.refinement(KrakenFuturesTickersFields, () => true, 'KrakenFuturesTickersDataType'),
    snapshot: t.array(KrakenFuturesTickersFields, 'KrakenFuturesTickersSnapshotType'),
  },
  bitmex: {
    data: t.refinement(BitmexTickersFuturesFields, () => true, 'BitmexFuturesTickersDataType'),
    snapshot: t.array(BitmexTickersFuturesFields, 'BitmexFuturesTickersSnapshot'),
  },
}

export const ALL_FUTURES_TICKERS_DATA_TYPES = [
  ExchangeFuturesTickersTypes.kraken.data,
  ExchangeFuturesTickersTypes.bitmex.data,
]
