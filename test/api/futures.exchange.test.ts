import { Sockets } from '../../src/sockets'
import { ExchangeChannel } from '../../src/sockets/crypto/common'
import { ExchangeFuturesSocket, MaturationInterval } from '../../src/sockets/crypto/futures'
import { FuturesExchangeSymbols } from '../../src/types/exchange/common/symbols'
import { FuturesExchange } from '../../src/types/exchange/futures'
import { MockLnClient } from '../mock.ln.client'
import { testDebug } from '../test.util'

const sockets: ExchangeFuturesSocket[] = []
let socket: ExchangeFuturesSocket = null as any

const JEST_TIMEOUT = 20 * 1000 // 20 seconds
const SUB_DURATION = Math.floor(JEST_TIMEOUT / 6)

beforeAll(async () => {
  jest.setTimeout(JEST_TIMEOUT)
  testDebug('Requesting exchange futures socket')
  const s = await Sockets.exchangeFutures(MockLnClient)
  testDebug('Got exchange futures socket!')
  socket = s
  sockets.push(s)
  testDebug('beforeAll futures complete')
})

afterAll(async () => {
  testDebug('Closing exchange spot sockets')
  return Promise.all(sockets.map(s => s.close()))
})

const intervals: MaturationInterval[] = ['monthly', 'perpetual', 'quarterly']
const randomInterval = () => intervals[Math.floor(Math.random() * intervals.length)]

const testHelper = async <C extends ExchangeChannel, E extends FuturesExchange>(
  channel: C,
  exchange: E,
  symbol: FuturesExchangeSymbols<E>
) => {
  await new Promise((resolve, reject) => {
    if (!socket) {
      return reject('futures socket is null!')
    }

    try {
      socket[channel]({
        exchange,
        symbol,
        interval: randomInterval(),
        duration: SUB_DURATION,
        onData: data => expect(data).toBeDefined,
        onSnapshot: snapshot => expect(snapshot).not.toHaveLength(0),
        onSubscriptionEnded: () => {
          return resolve()
        },
      })
    } catch (err) {
      reject(err)
    }
  })
  // wait for a bit at the end, to give time for UUIDs to get
  // cleared on server
  return new Promise(resolve => setTimeout(resolve, 1500))
}

describe('Exchange futures API socket', () => {
  describe('Kraken', () => {
    it('must fail to subscribe to books', async () => expect(testHelper('books', 'kraken', 'BTCUSD')).toThrowError)
    it('must subscribe to trades', async () => testHelper('trades', 'kraken', 'BTCUSD'))
    it('must subscribe to tickers', async () => testHelper('tickers', 'kraken', 'ETHUSD'))
  })
})
