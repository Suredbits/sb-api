import * as t from 'io-ts'

import { getCompactableComposition } from 'fp-ts/lib/Compactable'
import { ExchangeSymbols } from '../common/symbols'
import { MaturationIntervalType } from './common'

const CommonTickersFields = t.intersection([
  t.type({
    ask: t.number,
    bid: t.number,
    eventTime: t.Integer,
    index: t.number,
    last: t.number,
    leverage: t.string,
    maturationInterval: MaturationIntervalType,
    markPrice: t.number,
    openInterest: t.number,
    priceChange: t.number,
    volume: t.number,
  }),
  t.partial({
    /**
     * Only present if subscribing to perpetual contracts
     */
    maturationTime: t.Int,

    /**
     * Only present if subscribing to perpetual contracts
     */
    nextFundingRateTime: t.number,

    /**
     * Only present if subscribing to perpetual contracts
     */
    fundingRate: t.number,

    /**
     * Only present if subscribing to perpetual contracts
     */
    fundingRatePrediction: t.number,
  }),
])

const KrakenFuturesTickersFields = t.intersection([
  CommonTickersFields,
  t.type({
    askSize: t.number,
    bidSize: t.number,
    premium: t.number,
    // statCloseTime: t.Integer,
    // statOpenTime: t.Integer,
    symbol: ExchangeSymbols.kraken.futures,
    // totalTrades: t.Integer,
    // volWeightedAvePrice: t.number,
    // weightedAvePrice: t.number, // BTCUSD
  }),
])

const BitmexTickersFuturesFields = t.intersection([
  CommonTickersFields,
  t.type({
    symbol: ExchangeSymbols.bitmex.futures,
    low: t.number,
    high: t.number,
    volWeightedAvePrice: t.number,
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
