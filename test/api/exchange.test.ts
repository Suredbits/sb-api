import { Sockets } from '../../src/sockets'
import { ExchangeChannel, ExchangeSpotSocket } from '../../src/sockets/crypto/spot'
import { ExchangeSymbol, ExchangeSymbols } from '../../src/types/exchange/common/symbols'
import { SpotExchange } from '../../src/types/exchange/spot'
import { MockLnClient } from '../mock.ln.client'

const sockets: ExchangeSpotSocket[] = []
let socket: ExchangeSpotSocket = null as any

const JEST_TIMEOUT = 20 * 1000 // 20 seconds
const SUB_DURATION = Math.floor(JEST_TIMEOUT / 6)

beforeAll(async () => {
  jest.setTimeout(JEST_TIMEOUT)
  const s = await Sockets.exchange(MockLnClient)
  socket = s
  sockets.push(s)
})

afterAll(async () => {
  return Promise.all(sockets.map(s => s.close()))
})

const testHelper = async <C extends ExchangeChannel<E>, E extends SpotExchange>(
  channel: C,
  exchange: E,
  symbol: ExchangeSymbols<E>
) => {
  await new Promise((resolve, reject) => {
    if (!socket) {
      return reject('socket is null!')
    }
    socket[channel]({
      exchange,
      symbol,
      duration: SUB_DURATION,
      onData: data => expect(data).toBeDefined,
      onSnapshot: snapshot => expect(snapshot).not.toHaveLength(0),
      onSubscriptionEnded: () => {
        return resolve()
      },
    })
  })
  // wait for a bit at the end, to give time for UUIDs to get
  // cleared on server
  return new Promise(resolve => setTimeout(resolve, 1500))
}

describe('Exchange API socket', () => {
  describe('Bitfinex', () => {
    it('must subscrbe to books', async () => testHelper('books', 'bitfinex', 'BTCUSD'))
    it('must subscrbe to trades', async () => testHelper('trades', 'bitfinex', 'ETHBTC'))
    it('must subscrbe to tickers', async () => testHelper('tickers', 'bitfinex', 'ETHUSD'))
  })

  describe('Binance', () => {
    it('must subscribe to trades', async () => testHelper('trades', 'binance', 'ETHBTC'))
    it('must subscribe to tickers', async () => testHelper('tickers', 'binance', 'ETHUSDT'))
  })

  describe('Gemini', () => {
    it('must subscribe to books', async () => testHelper('books', 'gemini', 'BTCUSD'))
    it('must subscribe to trades', async () => testHelper('trades', 'gemini', 'BTCUSD'))
    it('must subscribe to tickers', async () => testHelper('tickers', 'gemini', 'BTCUSD'))
  })

  describe('Bitstamp', () => {
    it('must subscribe to books', async () => testHelper('books', 'bitstamp', 'BTCUSD'))
    it('must subscribe to trades', async () => testHelper('trades', 'bitstamp', 'ETHBTC'))
    it('must subscribe to tickers', async () => testHelper('tickers', 'bitstamp', 'ETHUSD'))
  })

  describe('Coinbase', () => {
    it('must subscribe to books', async () => testHelper('books', 'coinbase', 'ETHBTC'))
    it('must subscribe to trades', async () => testHelper('trades', 'coinbase', 'BTCUSD'))
    it('must subscribe to tickers', async () => testHelper('tickers', 'coinbase', 'ETHBTC'))
  })
})
