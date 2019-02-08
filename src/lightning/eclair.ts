import request from 'request-promise-native'

import { LightningApi } from '.'

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
   * Defaults to `80`
   */
  port?: number
}

export class Eclair implements LightningApi {
  private uri: string
  public constructor({ host = 'localhost', rpcPass, port = 80 }: EclairArgs) {
    // Eclair does not have users, user field is therefore blank
    this.uri = `http://:${rpcPass}@${host}:${port}`
  }

  public receive = (description: string = '') => this.sendRpcReq('receive', description).then(({ result }) => result)

  public send = (invoice: string) => this.sendRpcReq('send', invoice)

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
