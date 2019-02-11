import assertNever from 'assert-never'
import makeDebug from 'debug'
import WebSocket from 'ws'

import { BitcoinNetwork, LightningApi } from '../lightning'
import { MessageTypes, WelcomeMessageType } from '../types'

export type OnWsOpen = (msg: WelcomeMessageType) => any

export const enum API {
  NFL = 'nfl',
  NBA = 'nba',
  crypto = 'crypto',
}

export interface AtleastUUID {
  uuid: string
}

export type MaybeUUID = Partial<AtleastUUID>

const debug = makeDebug('socket:base')

export abstract class SbWebSocket {
  public url = this.getApiUrl()

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
    } else if (this.api === API.crypto) {
      return prefix + '/exchange/v0'
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
      debug('Parsed message: %O', parsed)
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
  }

  protected abstract async handleMessage(uuid: string, parsed: AtleastUUID, data: WebSocket.Data): Promise<any>
}
