import makeDebug from 'debug'
import * as t from 'io-ts'
import WebSocket from 'ws'

import { MessageTypes, PpcDataMessageType, SocketValidate } from '../types'
import { UUID } from '../uuid'
import { AtleastUUID, SbWebSocket } from './common'

const debug = makeDebug('sb-api:socket:ppc')

export abstract class PayPerCallSocket extends SbWebSocket {
  protected sendRequest = (request: object, type: t.Type<any>, requestType?: string): Promise<any> => {
    const reqWithUuid = { ...request, uuid: UUID.newUUID() }
    this.ws.send(JSON.stringify(reqWithUuid))
    debug(`Sending ${requestType ? requestType + ' ' : ''} request with UUID ${reqWithUuid.uuid}`)
    return new Promise((resolve, reject) => {
      this.pendingRequests[reqWithUuid.uuid] = { resolve, reject, type }
      setTimeout(() => {
        const str = `${requestType ? requestType + ' request' : 'Request'} with UUID ${reqWithUuid.uuid} timed out!`

        reject(Error(str))
      }, 15_000) // time out after 15 seconds
    })
  }

  protected handleMessage = async (uuid: string, parsed: AtleastUUID, data: WebSocket.Data) => {
    const res = this.pendingRequests[uuid]
    if (!res) {
      throw Error(`Couldn't resolve response for request with UUID ${uuid}`)
    }
    const { type, resolve, reject } = res
    debug(`Message is of type ${type.name}`)

    if (MessageTypes.isInvoice(parsed)) {
      debug('Message is invoice message')

      this.ln.send(parsed.invoice)
    } else if (MessageTypes.isPpcDataResponse(parsed, type)) {
      const msg = SocketValidate.data(data, type, reject)
      debug('Message is data message with UUID %s', uuid)

      this.pendingRequests[uuid] = undefined
      if (MessageTypes.isInfoType(type)) {
        resolve(msg.data as any)
      } else if (Array.isArray(msg.data)) {
        resolve(msg.data)
      } else {
        reject(`Expected data array for response with UUID ${uuid}, got single element!`)
      }
    } else {
      const str = `Couldn't figure out message type for message ${JSON.stringify(parsed)}`
      debug(str)
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
      debug(str)
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
