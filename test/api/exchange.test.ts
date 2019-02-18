import { Sockets } from '../../src/sockets'
import { ExchangeChannel, ExchangeSocket } from '../../src/sockets/crypto'
import { Exchange } from '../../src/types/exchange'
import { ExchangeSymbol, ExchangeSymbols } from '../../src/types/exchange/symbols'
import { MockLnClient } from '../mock.ln.client'

const sockets: ExchangeSocket[] = []
let socket: ExchangeSocket = null as any

const JEST_TIMEOUT = 10 * 1000 // 10 seconds
const SUB_DURATION = Math.floor(JEST_TIMEOUT / 3)

beforeAll(async () => {
  jest.setTimeout(JEST_TIMEOUT)
  const s = await Sockets.exchange(MockLnClient)
  socket = s
  sockets.push(s)
})

afterAll(async () => {
  return Promise.all(sockets.map(s => s.close()))
})

const testHelper = <C extends ExchangeChannel<E>, E extends Exchange>(
  channel: C,
  exchange: E,
  symbol: ExchangeSymbols<E>
) => {
  return new Promise(resolve => {
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
