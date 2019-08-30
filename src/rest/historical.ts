import * as t from 'io-ts'
import * as types from 'io-ts-types'

import { BitcoinNetwork, LightningApi } from '../lightning'
import { Exchange } from '../sockets/crypto/common'
import { ExchangeSymbols } from '../types/exchange/common/symbols'
import { makeRestRequest } from './rest'

type HistoricalRestAPIPeriod = 'daily' | 'weekly' | 'monthly'

type HistoricalRestAPIYear = 2019 | 2018

const DecryptedHistoricalResponse = t.array(
  t.type({
    timestamp: types.DateFromISOString,
    price: t.number,
    pair: t.string, // TODO
  })
)

export type DecryptedHistoricalResponse = t.TypeOf<typeof DecryptedHistoricalResponse>

interface HistoricalRestAPIArgs<E extends Exchange> {
  exchange: E
  pair: ExchangeSymbols<E>
  year: HistoricalRestAPIYear
  period: HistoricalRestAPIPeriod
  network?: BitcoinNetwork
}

interface HistoricalRestAPI {
  call: <E extends Exchange>(args: HistoricalRestAPIArgs<E>) => Promise<DecryptedHistoricalResponse>
}

export const HistoricalRestAPI: (ln: LightningApi) => HistoricalRestAPI = lightning => {
  return {
    call: async ({ exchange, pair, year, period, network = 'mainnet' }) => {
      let baseURL: string
      if (network === BitcoinNetwork.mainnet) {
        baseURL = 'https://api.suredbits.com/historical/v0'
      } else {
        baseURL = 'https://test.api.suredbits.com/historical/v0'
      }
      baseURL = 'http://localhost:8072/historical/v0'
      const elements = [exchange, pair, year, period]
      const path = '/' + elements.join('/')
      const fullPath = baseURL + path

      return makeRestRequest(lightning, fullPath, DecryptedHistoricalResponse)
    },
  }
}
