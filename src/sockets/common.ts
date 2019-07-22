import assertNever from 'assert-never'
import makeDebug from 'debug'
import WebSocket from 'ws'

import { BitcoinNetwork, LightningApi } from '../lightning'
import { MessageTypes, WelcomeMessageType } from '../types'

export type OnWsOpen = (msg: WelcomeMessageType) => any

export enum API {
  NFL = 'nfl',
  NBA = 'nba',
  spot = 'spot',
  futures = 'futures',
}

export interface AtleastUUID {
  uuid: string
}

export type MaybeUUID = Partial<AtleastUUID>

const debug = makeDebug('sb-api:socket:base')

type PromiseResolver = () => void

export abstract class SbWebSocket {
  public url = this.getApiUrl()

  private closePromiseResolver: PromiseResolver | undefined = undefined
  public close = async (): Promise<void> => {
    return new Promise(resolve => {
      this.closePromiseResolver = resolve
      const TIMEOUT = 2500
      debug('Closing WS connection')
      this.ws.close(WS_CODENAMES.CLOSE_NORMAL)
      setTimeout(() => {
        if (this.ws.readyState !== this.ws.CLOSED) {
          debug(`WS readyState: ${this.ws.readyState}`)
          debug(`WS state is not closed after ${TIMEOUT} ms, terminating connection`)
          this.ws.terminate()
          debug('Terminated WS connection')
        }
      }, TIMEOUT)
    })
  }

  protected ws = (() => {
    debug(`Opening up connection at ${this.url}`)
    return new WebSocket(this.url)
  })()

  private getApiUrl(): string {
    const prefix = `wss://${this.network === BitcoinNetwork.testnet ? 'test.' : ''}api.suredbits.com`
    if (this.api === API.NFL) {
      return prefix + '/nfl/v0'
    } else if (this.api === API.NBA) {
      return prefix + '/nba/v0'
    } else if (this.api === API.spot) {
      return prefix + '/exchange/v0'
    } else if (this.api === API.futures) {
      return prefix + '/futures/v0'
    } else {
      return assertNever(this.api)
    }
  }

  constructor(protected api: API, protected ln: LightningApi, onOpen: OnWsOpen, private network: BitcoinNetwork) {
    this.ws.on('open', () => {
      debug(`Opened up connection to ${this.url}`)
    })

    this.ws.on('message', async data => {
      const parsed: MaybeUUID = JSON.parse(data.toString())
      debug(`Received message with fields: ${Object.getOwnPropertyNames(parsed).join(', ')}`)
      if (MessageTypes.isInitMsg(parsed)) {
        debug('Message is welcome message')
        onOpen(parsed)
      } else {
        if (!parsed.uuid) {
          throw Error("Couldn't find UUID on message " + JSON.stringify(parsed))
        }
        debug('Message has UUID %s', parsed.uuid)
        return this.handleMessage(parsed.uuid, parsed as AtleastUUID, data)
      }
    })

    this.ws.on('close', (code, reason) => {
      debug(
        `WS connection closed. Code: ${code} (${WS_CODES[code] || 'Unknown code'}). ${reason ? 'Reason:' + reason : ''}`
      )

      const closePromiseResolver = this.closePromiseResolver
      if (closePromiseResolver) {
        debug('Resolving close promise')
        closePromiseResolver()
      }
    })
  }

  protected abstract async handleMessage(uuid: string, parsed: AtleastUUID, data: WebSocket.Data): Promise<any>
}

const WS_CODES: { [code: number]: string | undefined } = {
  1000: 'Successful operation / regular socket shutdown',
  1006: 'No close code frame has been receieved',
}

const WS_CODENAMES = {
  CLOSE_NORMAL: 1000,
}
