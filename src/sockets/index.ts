import { BitcoinNetwork, LightningApi } from '../lightning'
import { WelcomeMessageType } from '../types'
import { SbWebSocket } from './common'
import { API } from './common'
import { ExchangeSocket, ExchangeSocketTestnet } from './crypto'
import { NbaSocket, NbaSocketTestnet } from './nba'
import { NflSocket, NflSocketTestnet } from './nfl'

export const Sockets = {
  exchange: (ln: LightningApi): Promise<ExchangeSocket> =>
    makeSbWebSocket(API.crypto, ln, BitcoinNetwork.mainnet) as any,

  nfl: (ln: LightningApi): Promise<NflSocket> => makeSbWebSocket(API.NFL, ln, BitcoinNetwork.mainnet) as any,

  nba: (ln: LightningApi): Promise<NbaSocket> => makeSbWebSocket(API.NBA, ln, BitcoinNetwork.mainnet) as any,

  exchangeTestnet: (ln: LightningApi): Promise<ExchangeSocketTestnet> =>
    makeSbWebSocket(API.crypto, ln, BitcoinNetwork.testnet) as any,

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
    | typeof ExchangeSocket
    | typeof ExchangeSocketTestnet
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
  } else if (api === API.crypto) {
    if (network === BitcoinNetwork.testnet) {
      clazz = ExchangeSocketTestnet
    } else {
      clazz = ExchangeSocket
    }
  }

  // this is hacky
  let socket: SbWebSocket = null as any
  const welcomeMsg = await new Promise<WelcomeMessageType>(resolve => {
    socket = new clazz(eclair, msg => resolve(msg))
  })
  return socket
}
