import { toUnfoldable } from 'fp-ts/lib/StrMap'
import * as t from 'io-ts'
import { Exchange } from '../../../sockets/crypto/common'
import { FuturesExchange } from '../futures'
import { SpotExchange } from '../spot'

const BinanceSymbols = t.keyof({
  BTCUSDT: t.null,
  ETHBTC: t.null,
  ETHUSDT: t.null,
})
type BinanceSymbols = t.TypeOf<typeof BinanceSymbols>

const KrakenSpotSymbols = t.keyof({
  ETHBTC: t.null,
  BTCUSD: t.null,
  ETHUSD: t.null,
})

type KrakenSpotSymbols = t.TypeOf<typeof KrakenSpotSymbols>

const KrakenFuturesSymbols = t.keyof({
  BTCUSD: t.null,
  ETHUSD: t.null,
})

type KrakenFuturesSymbols = t.TypeOf<typeof KrakenFuturesSymbols>

const BitmexSpotSymbols = t.keyof({ shouldNotAppear: t.null })

type BitmexSpotSymbols = t.TypeOf<typeof BitmexSpotSymbols>

const BitmexFuturesSymbols = t.keyof({
  BTCUSD: t.null,
  ETHUSD: t.null,
  ETHBTC: t.null,
})

type BitmexFuturesSymbols = t.TypeOf<typeof BitmexFuturesSymbols>

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

export type ExchangeSymbols<T extends Exchange> = T extends FuturesExchange
  ? FuturesExchangeSymbols<T>
  : T extends SpotExchange
  ? SpotExchangeSymbols<T>
  : never

export type ExchangeSymbol =
  | ExchangeSymbols<'kraken'>
  | ExchangeSymbols<'binance'>
  | ExchangeSymbols<'coinbase'>
  | ExchangeSymbols<'bitstamp'>
  | ExchangeSymbols<'gemini'>
  | ExchangeSymbols<'bitfinex'>

export type FuturesExchangeSymbols<T extends FuturesExchange> = T extends 'kraken'
  ? KrakenFuturesSymbols
  : T extends 'bitmex'
  ? BitmexFuturesSymbols
  : never

export type SpotExchangeSymbol =
  | SpotExchangeSymbols<'binance'>
  | SpotExchangeSymbols<'bitfinex'>
  | SpotExchangeSymbols<'gemini'>
  | SpotExchangeSymbols<'bitstamp'>
  | SpotExchangeSymbols<'coinbase'>
  | SpotExchangeSymbols<'kraken'>

export type SpotExchangeSymbols<T extends SpotExchange> = T extends 'binance'
  ? BinanceSymbols
  : T extends 'bitfinex'
  ? BitfinexSymbols
  : T extends 'coinbase'
  ? CoinbaseSymbols
  : T extends 'gemini'
  ? GeminiSymbols
  : T extends 'bitstamp'
  ? BitstampSymbols
  : T extends 'kraken'
  ? KrakenSpotSymbols
  : T extends 'bitmex'
  ? BitmexSpotSymbols
  : never

export const ExchangeSymbols = {
  binance: BinanceSymbols,
  bitfinex: BitfinexSymbols,
  coinbase: CoinbaseSymbols,
  gemini: GeminiSymbols,
  bitstamp: BitstampSymbols,
  kraken: {
    spot: KrakenSpotSymbols,
    futures: KrakenFuturesSymbols,
  },
  bitmex: {
    spot: BitmexSpotSymbols,
    futures: BitmexFuturesSymbols,
  },
}
