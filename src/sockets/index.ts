import { BitcoinNetwork, LightningApi } from '../lightning'
import { WelcomeMessageType } from '../types'
import { SbWebSocket } from './common'
import { API } from './common'
import { ExchangeSpotSocket, ExchangeSpotSocketTestnet } from './crypto/spot'
import { NbaSocket, NbaSocketTestnet } from './nba'
import { NflSocket, NflSocketTestnet } from './nfl'

export const Sockets = {
  exchange: (ln: LightningApi): Promise<ExchangeSpotSocket> =>
    makeSbWebSocket(API.spot, ln, BitcoinNetwork.mainnet) as any,

  nfl: (ln: LightningApi): Promise<NflSocket> => makeSbWebSocket(API.NFL, ln, BitcoinNetwork.mainnet) as any,

  nba: (ln: LightningApi): Promise<NbaSocket> => makeSbWebSocket(API.NBA, ln, BitcoinNetwork.mainnet) as any,

  exchangeTestnet: (ln: LightningApi): Promise<ExchangeSpotSocketTestnet> =>
    makeSbWebSocket(API.spot, ln, BitcoinNetwork.testnet) as any,

  nflTestnet: (ln: LightningApi): Promise<NflSocketTestnet> =>
    makeSbWebSocket(API.NFL, ln, BitcoinNetwork.testnet) as any,

  nbaTestnet: (ln: LightningApi): Promise<NbaSocketTestnet> =>
    makeSbWebSocket(API.NBA, ln, BitcoinNetwork.testnet) as any,
}

const makeSbWebSocket = async (api: API, eclair: LightningApi, network: BitcoinNetwork): Promise<SbWebSocket> => {
  let clazz:
    | typeof NbaSocket
    | typeof NbaSocketTestnet
    | typeof NflSocket
    | typeof NflSocketTestnet
    | typeof ExchangeSpotSocket
    | typeof ExchangeSpotSocketTestnet
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
  }

  // this is hacky
  let socket: SbWebSocket = null as any
  const welcomeMsg = await new Promise<WelcomeMessageType>(resolve => {
    socket = new clazz(eclair, msg => resolve(msg))
  })
  return socket
}
