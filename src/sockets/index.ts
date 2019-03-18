import assertNever from 'assert-never'
import makeDebug from 'debug'

import { BitcoinNetwork, LightningApi } from '../lightning'
import { WelcomeMessageType } from '../types'
import { SbWebSocket } from './common'
import { API } from './common'
import { ExchangeFuturesSocket, ExchangeFuturesSocketTestnet } from './crypto/futures'
import { ExchangeSpotSocket, ExchangeSpotSocketTestnet } from './crypto/spot'
import { NbaSocket, NbaSocketTestnet } from './nba'
import { NflSocket, NflSocketTestnet } from './nfl'

const debug = makeDebug('sb-api:socket:base')

export const Sockets = {
  exchangeSpot: (ln: LightningApi): Promise<ExchangeSpotSocket> =>
    makeSbWebSocket(API.spot, ln, BitcoinNetwork.mainnet) as any,

  exchangeFutures: (ln: LightningApi): Promise<ExchangeFuturesSocket> =>
    makeSbWebSocket(API.futures, ln, BitcoinNetwork.mainnet) as any,

  nfl: (ln: LightningApi): Promise<NflSocket> => makeSbWebSocket(API.NFL, ln, BitcoinNetwork.mainnet) as any,

  nba: (ln: LightningApi): Promise<NbaSocket> => makeSbWebSocket(API.NBA, ln, BitcoinNetwork.mainnet) as any,

  exchangeSpotTestnet: (ln: LightningApi): Promise<ExchangeSpotSocketTestnet> =>
    makeSbWebSocket(API.spot, ln, BitcoinNetwork.testnet) as any,

  exchangeFuturesTestnet: (ln: LightningApi): Promise<ExchangeFuturesSocketTestnet> =>
    makeSbWebSocket(API.futures, ln, BitcoinNetwork.testnet) as any,

  nflTestnet: (ln: LightningApi): Promise<NflSocketTestnet> =>
    makeSbWebSocket(API.NFL, ln, BitcoinNetwork.testnet) as any,

  nbaTestnet: (ln: LightningApi): Promise<NbaSocketTestnet> =>
    makeSbWebSocket(API.NBA, ln, BitcoinNetwork.testnet) as any,
}

const makeSbWebSocket = async (api: API, ln: LightningApi, network: BitcoinNetwork): Promise<SbWebSocket> => {
  debug(`Making websocket for ${api} API on ${network}`)
  let clazz:
    | typeof NbaSocket
    | typeof NbaSocketTestnet
    | typeof NflSocket
    | typeof NflSocketTestnet
    | typeof ExchangeSpotSocket
    | typeof ExchangeSpotSocketTestnet
    | typeof ExchangeFuturesSocket
    | typeof ExchangeFuturesSocketTestnet
  if (api === API.NFL) {
    if (network === BitcoinNetwork.testnet) {
      clazz = NflSocketTestnet
    } else {
      clazz = NflSocket
    }
  } else if (api === API.NBA) {
    if (network === BitcoinNetwork.testnet) {
      clazz = NbaSocketTestnet
    } else {
      clazz = NbaSocket
    }
  } else if (api === API.spot) {
    if (network === BitcoinNetwork.testnet) {
      clazz = ExchangeSpotSocketTestnet
    } else {
      clazz = ExchangeSpotSocket
    }
  } else if (api === API.futures) {
    if (network === BitcoinNetwork.testnet) {
      clazz = ExchangeFuturesSocketTestnet
    } else {
      clazz = ExchangeFuturesSocket
    }
  } else {
    assertNever(api)
  }

  // this is hacky
  let socket: SbWebSocket = null as any
  const welcomeMsg = await new Promise<WelcomeMessageType>(resolve => {
    socket = new clazz(ln, msg => {
      debug('Received welcome message!')
      resolve(msg)
    })
  })
  debug(`Made socket for ${api} on ${network}`)
  return socket
}
