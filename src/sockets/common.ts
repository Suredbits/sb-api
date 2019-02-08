import assertNever from 'assert-never'
import * as t from 'io-ts'
import genUuid from 'uuid'
import WebSocket from 'ws'
import { API } from '.'
import { BitcoinNetwork, LightningApi } from '../lightning'
import { Logger } from '../logging'
import { MessageTypes, PpcDataMessageType, WelcomeMessageType } from '../types'

export type OnWsOpen = (msg: WelcomeMessageType) => any

export interface AtleastUUID {
  uuid: string
}

export type MaybeUUID = Partial<AtleastUUID>

export abstract class SbWebSocket {
  public url = this.getApiUrl()

  public ws = (() => {
    Logger.info(`Opening up connection at ${this.url}`)
    return new WebSocket(this.url)
  })()

  private getApiUrl(): string {
    const prefix = `wss://${this.network === BitcoinNetwork.testnet ? 'test.' : ''}api.suredbits.com`
    if (this.api === API.NFL) {
      return prefix + '/nfl/v0'
    } else if (this.api === API.NBA) {
      return prefix + '/nba/v0'
    } else if (this.api === API.crypto) {
      return PeriodicWave + '/exchange/v0'
    } else {
      return assertNever(this.api)
    }
  }

  constructor(public api: API, protected ln: LightningApi, onOpen: OnWsOpen, private network: BitcoinNetwork) {
    this.ws.on('open', () => {
      Logger.info(`Opened up connection to ${this.url}`)
    })

    this.ws.on('message', async data => {
      const parsed: MaybeUUID = JSON.parse(data.toString())
      Logger.debug('Parsed message: %O', parsed)
      Logger.debug(`Received message with fields: ${Object.getOwnPropertyNames(parsed).join(', ')}`)
      if (MessageTypes.isInitMsg(parsed)) {
        Logger.debug('Message is welcome message')
        onOpen(parsed)
      } else {
        if (!parsed.uuid) {
          throw Error("Couldn't find UUID on message " + JSON.stringify(parsed))
        }
        Logger.debug('Message has UUID %s', parsed.uuid)
        return this.handleMessage(parsed.uuid, parsed as AtleastUUID, data)
      }
    })
  }

  public abstract async handleMessage(uuid: string, parsed: AtleastUUID, data: WebSocket.Data): Promise<any>
}

export abstract class PayPerCallSocket extends SbWebSocket {
  protected sendRequest = (request: object, type: t.Type<any>, requestType?: string): Promise<any> => {
    const reqWithUuid = { ...request, uuid: genUuid() }
    this.ws.send(JSON.stringify(reqWithUuid))
    Logger.info(`Sending ${requestType ? requestType + ' ' : ''} request with UUID ${reqWithUuid.uuid}`)
    return new Promise((resolve, reject) => {
      this.pendingRequests[reqWithUuid.uuid] = { resolve, reject, type }
      setTimeout(() => {
        const str = `${requestType ? requestType + ' request' : 'Request'} with UUID ${reqWithUuid.uuid} timed out!`

        reject(Error(str))
      }, 15_000) // time out after 15 seconds
    })
  }

  public handleMessage = async (uuid: string, parsed: AtleastUUID, data: WebSocket.Data) => {
    const res = this.pendingRequests[uuid]
    if (!res) {
      throw Error(`Couldn't resolve response for request with UUID ${uuid}`)
    }
    const { type, resolve, reject } = res
    Logger.debug(`Message is of type ${type.name}`)

    if (MessageTypes.isInvoice(parsed)) {
      Logger.debug('Message is invoice message')

      this.ln.send(parsed.invoice)
    } else if (MessageTypes.isPpcDataResponse(parsed, type)) {
      const msg = validateDataMessage(data, type, reject)
      Logger.debug('Message is data message with UUID %s', uuid)

      this.pendingRequests[uuid] = undefined
      if (Array.isArray(msg.data)) {
        resolve(msg.data)
      } else {
        reject(`Expected data array for response with UUID ${uuid}, got single element!`)
      }
    } else {
      const str = `Couldn't figure out message type for message ${JSON.stringify(parsed)}`
      Logger.error(str)
      reject(Error(str))
    }
  }

  protected pendingRequests: {
    [uuid: string]: PendingRequest | undefined
  } = {}

  private getDataType = (msg: PpcDataMessageType) => {
    const res = this.pendingRequests[msg.uuid]
    if (!res) {
      const str = `Couldn't resolve type for request with UUID ${msg.uuid}`
      Logger.error(str)
      throw new Error(str)
    } else {
      return res.type
    }
  }
}

interface PendingRequest {
  resolve: (data: any[]) => void
  reject: (err: any) => any
  type: t.Type<any>
}
