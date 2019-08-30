import lodash from 'lodash'

import { DecryptedHistoricalResponse, HistoricalRestAPI } from '../../src/rest/historical'
import { Exchange } from '../../src/sockets/crypto/common'
import { ExchangeSymbols } from '../../src/types/exchange/common/symbols'
import { MockLnClient } from '../mock.ln.client'

describe.only('Historical crypto prices API', async () => {
  it('should get daily prices', async () => {
    const daily = await HistoricalRestAPI(MockLnClient).call({
      exchange: 'binance',
      pair: 'BTCUSDT',
      period: 'daily',
      year: 2019,
    })
    expect(daily.length).toBeGreaterThan(0)
  })

  it('should get monthly prices', async () => {
    const monthly = await HistoricalRestAPI(MockLnClient).call({
      exchange: 'bitfinex',
      pair: 'ETHBTC',
      period: 'monthly',
      year: 2019,
    })
    expect(monthly.length).toBeGreaterThan(0)
  })

  it('should get weekly prices', async () => {
    const weekly = await HistoricalRestAPI(MockLnClient).call({
      exchange: 'bitmex',
      pair: 'BTCUSD',
      period: 'weekly',
      year: 2019,
    })
    expect(weekly.length).toBeGreaterThan(0)
  })

  it('should get data from all exchanges', async () => {
    const exchangesWithSymbol: { [key in Exchange]: ExchangeSymbols<key> } = {
      binance: 'ETHUSDT',
      bitfinex: 'ETHUSD',
      bitmex: 'BTCUSD',
      coinbase: 'BTCUSD',
      bitstamp: 'ETHUSD',
      gemini: 'BTCUSD',
      kraken: 'ETHUSD',
    }

    const periods = ['daily', 'monthly', 'weekly'] as const

    const pairs = lodash.toPairs(exchangesWithSymbol)
    const results = await Promise.all(
      pairs.map(([exchange, pair]) => {
        const request = {
          exchange: exchange as any,
          pair: pair as any,
          period: lodash.sample(periods),
          year: 2019 as any,
        }
        return HistoricalRestAPI(MockLnClient)
          .call(request)
          .then(res => [res, request])
      })
    )

    results.forEach(([res, request]: [DecryptedHistoricalResponse, any]) => {
      try {
        expect(res.length).toBeGreaterThan(0)
      } catch (err) {
        err.message = err.message + `\nRequest: ${JSON.stringify(request)}` + `\nResponse: ${JSON.stringify(res)}`
        throw err
      }
    })
  })
})

import * as t from 'io-ts'
