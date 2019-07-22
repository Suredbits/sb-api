import bolt11 from 'bolt11'
import makeDebug from 'debug'
import request from 'request-promise-native'

import { LightningApi } from '.'

const debug = makeDebug('sb-api:lightning:eclair')

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
    this.uri = `http://:${encodeURIComponent(rpcPass)}@${host}:${port}`
  }

  public receive = (description: string = '') => {
    debug('Generating invoice')
    return this.sendRpcReq('receive', ['description', description]).then(({ serialized }) => serialized)
  }

  public getPreimage = (invoice: string) => {
    debug(`Geting preimage for invoice ${invoice}`)
    const hash = bolt11
      .decode(invoice)
      .tags.find(t => t.tagName === 'payment_hash')!
      .data.toString()

    return this.sendRpcReq('getsentinfo', ['paymentHash', hash]).then(
      (attempts: Array<{ status: string; preimage: string }>) => {
        debug(`Payment attempts for invoice ${invoice.slice()}`)
        const succeded = attempts.find(a => a.status === 'SUCCEEDED')
        if (!succeded) {
          throw new Error(`Could not find preimage invoice ${invoice}`)
        } else {
          return succeded.preimage
        }
      }
    )
  }

  private awaitPayment = async (uuid: string): Promise<void> => {
    debug(`awaiting payment with uuid ${uuid}`)
    const starttime = Date.now()
    const timeout = 10_000
    return new Promise((resolve, reject) => {
      const impl = async (counter: number) => {
        debug(`checking payment with uuid ${uuid}, attempt no.: ${counter}`)
        const now = Date.now()
        if (now > starttime + timeout) {
          reject(`Payment with uuid ${uuid} timed out after ${timeout} millis`)
        } else {
          // when requesting with UUID always returns a 1-tuple
          const [result] = await this.sendRpcReq('getsentinfo', ['id', uuid])
          if (result.status === 'FAILED') {
            reject(`Payment with uuid ${uuid} failed`)
          } else if (result.status === 'SUCCEEDED') {
            debug(`Payment with uuid ${uuid} succeeded`)
            resolve()
          } else {
            setTimeout(() => impl(counter + 1), 1000) // 1 second timeoutk
          }
        }
      }
      impl(0)
    })
  }

  public send = async (invoice: string) => {
    debug(`Paying invoice ${invoice.slice(0, 25)}...`)
    const paymentUUID: string = await this.sendRpcReq('payinvoice', ['invoice', invoice])
    await this.awaitPayment(paymentUUID)
    return paymentUUID
  }

  public getInfo = () => this.sendRpcReq('getinfo')

  private sendRpcReq = (
    method: 'payinvoice' | 'receive' | 'getinfo' | 'getsentinfo',
    ...params: Array<[string, string | number]>
  ): Promise<any> => {
    const form: { [key: string]: string | number } = params.reduce(
      (prev, curr) => {
        const key = curr[0]
        const newObj = { ...prev }
        newObj[key] = curr[1]
        return newObj
      },
      {} as { [key: string]: string | number }
    )
    return request(`${this.uri}/${method}`, {
      json: true,
      method: 'POST',
      form,
    })
      .then(res => res)
      .catch(err => {
        throw err
      })
  }
}

export const Eclair = async (args: EclairArgs): Promise<Eclair> => {
  const client = new EclairImpl(args)
  debug('Trying to connect to client')
  const info = await client.getInfo().catch((err: Error) => {
    throw new Error(`Could not connect to Eclair! ${err.message}`)
  })
  debug('Succeeded!')
  debug('getinfo output: %o', info)
  return client
}
