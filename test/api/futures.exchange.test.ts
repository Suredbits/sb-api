import assertNever from 'assert-never'
import { Sockets } from '../../src/sockets'
import { ExchangeChannel } from '../../src/sockets/crypto/common'
import {
  BitmexMaturationInterval,
  ExchangeFuturesSocket,
  KrakenMaturationInterval,
  MaturationInterval,
  MaturationIntervalForExchangeAndSymbol,
} from '../../src/sockets/crypto/futures'
import { FuturesExchangeSymbols } from '../../src/types/exchange/common/symbols'
import { FuturesExchange } from '../../src/types/exchange/futures'
import { MaturationIntervalType } from '../../src/types/exchange/futures/common'
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

const bitmexIntervals: BitmexMaturationInterval[] = ['biquarterly', 'perpetual', 'quarterly']
const krakenIntervals: KrakenMaturationInterval[] = ['monthly', 'perpetual', 'quarterly']
const randomInterval = <E extends FuturesExchange, S extends FuturesExchangeSymbols<E>>(
  exchange: E,
  pair: S
): MaturationIntervalForExchangeAndSymbol<E, S> => {
  if (exchange === 'bitmex') {
    if (pair === 'BTCUSD') {
      return randomFromList(bitmexIntervals) as any
    } else if (pair === 'ETHBTC') {
      return 'quarterly' as any
    } else if (pair === 'ETHUSD') {
      return 'perpetual' as any
    } else {
      throw Error(`Unexpected pair ${pair} for bitmex`)
    }
  } else if (exchange === 'kraken') {
    return randomFromList(krakenIntervals) as any
  } else {
    throw Error(`Unexpected exchange ${exchange}`)
  }
}

const randomFromList = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const randomSymbol = <E extends FuturesExchange>(exchange: E): FuturesExchangeSymbols<E> => {
  switch (exchange) {
    case 'bitmex': {
      const bitmexSymbols: Array<FuturesExchangeSymbols<'bitmex'>> = ['BTCUSD', 'ETHBTC', 'ETHUSD']
      return randomFromList(bitmexSymbols) as any
    }
    case 'kraken': {
      const krakenSymbols: Array<FuturesExchangeSymbols<'kraken'>> = ['ETHUSD', 'BTCUSD']
      return randomFromList(krakenSymbols) as any
    }
    default: {
      throw Error(`Unknown exchange ${exchange}`)
    }
  }
}

const testHelper = async <C extends ExchangeChannel, E extends FuturesExchange>(channel: C, exchange: E) => {
  await new Promise((resolve, reject) => {
    if (!socket) {
      return reject('futures socket is null!')
    }

    const symbol = randomSymbol(exchange)

    socket[channel]({
      exchange,
      symbol,
      interval: randomInterval(exchange, symbol),
      duration: SUB_DURATION,
      onData: data => expect(data).toBeDefined,
      onSnapshot: snapshot => expect(snapshot).not.toHaveLength(0),
      onSubscriptionEnded: resolve,
    }).catch(reject)
  })
  // wait for a bit at the end, to give time for UUIDs to get
  // cleared on server
  return new Promise(resolve => setTimeout(resolve, 1500))
}

describe('Exchange futures API socket', () => {
  describe('Kraken', () => {
    it('must subscribe to books', async () => testHelper('books', 'kraken'))
    it('must subscribe to trades', async () => testHelper('trades', 'kraken'))
    it('must subscribe to tickers', async () => testHelper('tickers', 'kraken'))
  })

  describe('Bitmex', () => {
    it('must subscribe to tickers', async () => testHelper('tickers', 'bitmex'))
    it('must subscribe to trades', async () => testHelper('trades', 'bitmex'))
    it('must subscribe to books', async () => testHelper('books', 'bitmex'))
  })
})
