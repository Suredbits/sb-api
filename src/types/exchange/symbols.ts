import * as t from 'io-ts'
import { Exchange } from '.'

const BinanceSymbols = t.keyof({
  BTCUSDT: t.null,
  ETHBTC: t.null,
  ETHUSDT: t.null,
})
type BinanceSymbols = t.TypeOf<typeof BinanceSymbols>

const BitfinexSymbols = t.keyof({
  ETHBTC: t.null,
  BTCUSD: t.null,
  ETHUSD: t.null,
})

type BitfinexSymbols = t.TypeOf<typeof BitfinexSymbols>

const CoinbaseSymbols = t.keyof({
  ETHBTC: t.null,
  BTCUSD: t.null,
  ETHUSD: t.null,
})

type CoinbaseSymbols = t.TypeOf<typeof CoinbaseSymbols>

const BitstampSymbols = t.keyof({
  ETHBTC: t.null,
  BTCUSD: t.null,
  ETHUSD: t.null,
})

type BitstampSymbols = t.TypeOf<typeof BitstampSymbols>

const GeminiSymbols = t.keyof({
  BTCUSD: t.null,
})

type GeminiSymbols = t.TypeOf<typeof GeminiSymbols>

export type ExchangeSymbol =
  | ExchangeSymbols<'binance'>
  | ExchangeSymbols<'bitfinex'>
  | ExchangeSymbols<'gemini'>
  | ExchangeSymbols<'bitstamp'>
  | ExchangeSymbols<'coinbase'>

export type ExchangeSymbols<T extends Exchange> = T extends 'binance'
  ? BinanceSymbols
  : T extends 'bitfinex'
  ? BitfinexSymbols
  : T extends 'coinbase'
  ? CoinbaseSymbols
  : T extends 'gemini'
  ? GeminiSymbols
  : T extends 'bitstamp'
  ? BitstampSymbols
  : never

export const ExchangeSymbols = {
  binance: BinanceSymbols,
  bitfinex: BitfinexSymbols,
  coinbase: CoinbaseSymbols,
  gemini: GeminiSymbols,
  bitstamp: BitstampSymbols,
}
