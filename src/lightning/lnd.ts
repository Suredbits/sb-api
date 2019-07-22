import makeDebug from 'debug'
import lnd from 'lnd-async'

interface LndClient {
  sendPaymentSync: (args: { payment_request: string }) => Promise<any>
  addInvoice: (args: { memo?: string }) => Promise<any>
  getInfo: ({}) => Promise<any>
}

interface LndConnectArgs {
  lndHost?: string
  lndPort?: number
  noMacaroons?: boolean

  certPath?: string
  macaroonPath?: string

  cert?: string
  macaroon?: string
}

import { LightningApi } from '.'

const debug = makeDebug('sb-api:lightning:lnd')

export interface Lnd extends LightningApi {}

class LndImpl implements LightningApi {
  public constructor(private lndClient: LndClient) {}

  public getPreimage: (invoice: string) => Promise<string> = invoice => {
    debug(`Finding preimage to invoice ${invoice}`)
    const preimage = this.preimages[invoice]
    if (preimage) {
      return Promise.resolve(preimage)
    } else {
      return Promise.reject(new Error(`Could not find preimage for invoice ${invoice}`))
    }
  }

  public receive = (description?: string): Promise<string> => {
    debug('Generating invoice')
    return this.lndClient.addInvoice({ memo: description }).then(({ payment_request }) => payment_request)
  }

  public send = (invoice: string): Promise<any> => {
    debug(`Paying invoice ${invoice.slice(0, 25)}...`)
    return this.lndClient
      .sendPaymentSync({ payment_request: invoice })
      .then(res => {
        debug(`Result of paying invoice ${invoice.slice(0, 10)}: %O`, res)
        const preimage = res.payment_preimage.toString('hex')
        debug(`Adding preimage to invoice ${invoice.slice(0, 10)}: ${preimage}`)
        this.preimages[invoice] = preimage
        return res
      })
      .catch(err => {
        debug(`Error when paying invoice ${invoice.slice(0, 10)}: %O`, err)
        throw err
      })
  }

  private preimages: { [invoice: string]: string | undefined } = {}

  public getInfo = (): Promise<any> => this.lndClient.getInfo({})
}

export const Lnd = async (args?: LndConnectArgs): Promise<Lnd> => {
  debug('Trying to connect to LND')
  let client: any
  try {
    client = await lnd.connect(args)
  } catch (error) {
    debug(`Couldn't connect to LND: ${error.message}`)
    throw error
  }

  debug('Succeeded!')
  debug('Trying a getInfo call')
  const info = await client.getInfo({})
  debug('Succeeded!')
  debug('getInfo output: %o', info)
  return new LndImpl(client)
}
