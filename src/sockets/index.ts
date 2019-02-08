import { BitcoinNetwork, LightningApi } from '../lightning'
import { WelcomeMessageType } from '../types'
import { SbWebSocket } from './common'
import { ExchangeSocket, ExchangeSocketTestnet } from './crypto'
import { NbaSocket, NbaSocketTestnet } from './nba'
import { NflSocket } from './nfl'

export const enum API {
  NFL = 'nfl',
  NBA = 'nba',
  crypto = 'crypto',
}

export const Sockets = {
  exchange: (ln: LightningApi): Promise<ExchangeSocket> =>
    makeSbWebSocket(API.crypto, ln, BitcoinNetwork.mainnet) as any,

  nfl: (ln: LightningApi): Promise<NflSocket> => makeSbWebSocket(API.NFL, ln, BitcoinNetwork.mainnet) as any,

  nba: (ln: LightningApi): Promise<NbaSocket> => makeSbWebSocket(API.NBA, ln, BitcoinNetwork.mainnet) as any,

  exchangeTestnet: (ln: LightningApi): Promise<ExchangeSocketTestnet> =>
    makeSbWebSocket(API.crypto, ln, BitcoinNetwork.testnet) as any,

  nflTestnet: (ln: LightningApi): Promise<NflSocket> => makeSbWebSocket(API.NFL, ln, BitcoinNetwork.testnet) as any,

  nbaTestnet: (ln: LightningApi): Promise<NbaSocketTestnet> =>
    makeSbWebSocket(API.NBA, ln, BitcoinNetwork.testnet) as any,
}
const makeSbWebSocket = async (api: API, eclair: LightningApi, network: BitcoinNetwork): Promise<SbWebSocket> => {
  let clazz: typeof NbaSocket | typeof NflSocket | typeof ExchangeSocket
  if (api === API.NFL) {
    clazz = NflSocket
  } else if (api === API.NBA) {
    clazz = NbaSocket
  } else if (api === API.crypto) {
    clazz = ExchangeSocket
  }

  // this is hacky
  let socket: SbWebSocket = null as any
  const welcomeMsg = await new Promise<WelcomeMessageType>(resolve => {
    socket = new clazz(api, eclair, msg => resolve(msg))
  })
  return socket
}
