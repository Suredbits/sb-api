import makeDebug from 'debug'
import * as t from 'io-ts'
import * as types from 'io-ts-types'
import request from 'request-promise-native'

import { BitcoinNetwork, LightningApi } from '../lightning'
import { Exchange } from '../sockets/crypto/common'
import { RestValidate } from '../types'
import { ExchangeSymbols } from '../types/exchange/common/symbols'
import { decrypt } from './decrypt'

type HistoricalRestAPIPeriod = 'daily' | 'weekly' | 'monthly'

type HistoricalRestAPIYear = 2019 | 2018

const RawHistoricalResponse = t.type({
  invoice: t.string,
  encryptedData: t.string,
})

type RawHistoricalResponse = t.TypeOf<typeof RawHistoricalResponse>

const DecryptedHistoricalResponse = t.array(
  t.type({
    timestamp: types.DateFromISOString,
    price: t.number,
    pair: t.string, // TODO
  })
)

type DecryptedHistoricalResponse = t.TypeOf<typeof DecryptedHistoricalResponse>

interface HistoricalRestAPIArgs<E extends Exchange> {
  exchange: E
  pair: ExchangeSymbols<E>
  year: HistoricalRestAPIYear
  period: HistoricalRestAPIPeriod
  network: BitcoinNetwork
}

interface HistoricalRestAPI {
  call: <E extends Exchange>(args: HistoricalRestAPIArgs<E>) => Promise<any>
}

const debug = makeDebug('sb-api:rest')

export const HistoricalRestAPI: (ln: LightningApi) => HistoricalRestAPI = lightning => {
  return {
    call: async ({ exchange, pair, year, period, network }) => {
      let baseURL: string
      if (network === BitcoinNetwork.mainnet) {
        baseURL = 'https://api.suredbits.com/historical/v0'
      } else {
        baseURL = 'https://test.api.suredbits.com/historical/v0'
      }
      const path = '/' + [exchange, pair, year, period].join('/')
      let response: string
      const fullPath = baseURL + path
      try {
        response = await request.get(baseURL + path)
        debug(`Raw response from ${fullPath}: ${response}`)
      } catch (error) {
        debug(`Could not connect to API at ${fullPath}! ${error}`)
        throw error
      }
      const encrypted = RestValidate.data(JSON.parse(response), RawHistoricalResponse)

      await lightning.send(encrypted.invoice)

      const preimage = await lightning.getPreimage(encrypted.invoice)
      const decrypted = decrypt(encrypted.encryptedData, preimage)

      const validated = RestValidate.data(JSON.parse(decrypted), DecryptedHistoricalResponse)

      return validated
    },
  }
}
