import makeDebug from 'debug'
import request from 'request-promise-native'

import { LightningApi } from '.'

const debug = makeDebug('lightning:eclair')

interface EclairArgs {
  /**
   * Defaults to `localhost`
   */
  host?: string
  /**
   * The password to the Eclair RPC server
   */
  rpcPass: string
  /**
   * Defaults to `8080`
   */
  port?: number
}

export interface Eclair extends LightningApi {}

class EclairImpl implements LightningApi {
  private uri: string
  public constructor({ host = 'localhost', rpcPass, port = 8080 }: EclairArgs) {
    // Eclair does not have users, user field is therefore blank
    this.uri = `http://:${rpcPass}@${host}:${port}`
  }

  public receive = (description: string = '') => {
    debug('Generating invoice')
    return this.sendRpcReq('receive', description).then(({ result }) => result)
  }

  public send = (invoice: string) => {
    debug(`Paying invoice ${invoice.slice(0, 25)}...`)
    return this.sendRpcReq('send', invoice)
  }

  private sendRpcReq = (method: 'send' | 'receive', ...params: Array<string | number>): Promise<any> => {
    return request(this.uri, {
      json: true,
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        method,
        params,
      },
    })
      .then(res => res)
      .catch(err => {
        throw err
      })
  }
}

export const Eclair = (args: EclairArgs): Eclair => new EclairImpl(args)
