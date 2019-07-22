import assert from 'assert'
import makeDebug from 'debug'
import fsCb from 'fs'
import LightningClient from 'lightning-client'
import os from 'os'
import path from 'path'
import util from 'util'
import uuid from 'uuid'

import { LightningApi } from '.'

const debug = makeDebug('sb-api:lightning:clightning')
const lstat = util.promisify(fsCb.lstat)

export interface CLightning extends LightningApi {}

class CLightningImpl implements LightningApi {
  private client: LightningClient
  public constructor(rpcPath: string) {
    debug(`Connecting to c-lightning with rpcPath ${rpcPath}`)
    this.client = new LightningClient(rpcPath)
  }

  public getPreimage: (invoice: string) => Promise<string> = invoice => {
    debug(`Getting preimage for invoice ${invoice}`)
    const preimage = this.preimages[invoice]

    if (!preimage) {
      return Promise.reject(new Error(`Could not find preimage for invoice ${invoice}`))
    } else {
      return Promise.resolve(preimage)
    }
  }

  public receive = (description: string = ''): Promise<string> => {
    const uniqueLabel = uuid() // c-lightning requires all invoice labels to be unique

    // c-lightning expects the string 'any' to make an invoice without amount specified
    const amountMsat = 'any'

    debug(`Getting a new invoice with ${description ? `description: ${description}` : 'no description'}`)
    return this.client.invoice(amountMsat, uniqueLabel, description).then(({ bolt11 }) => bolt11)
  }

  public send = (invoice: string): Promise<any> => {
    debug(`Paying invoice ${invoice}`)
    return this.client
      .pay(invoice)
      .then(res => {
        debug(`Result of paying invoice ${invoice.slice(0, 10)}: %O`, res)
        this.preimages[invoice] = res.payment_preimage
        return res
      })
      .catch((err: Error) => {
        debug(`Error: when paying invoice: %O`, err)
        throw err
      })
  }

  /** Maps over paid invoices with their corresponding preimage */
  private preimages: { [invoice: string]: string | undefined } = {}

  public getInfo = (): Promise<any> => this.client.getinfo()
}

const DEFAULT_DATADIR = path.join(os.homedir(), '.lightning')
export const CLightning = async (rpcPath: string = DEFAULT_DATADIR): Promise<CLightning> => {
  debug(`rpcPath: ${rpcPath}`)
  const lstats = await lstat(rpcPath)
  const isDirectory = lstats.isDirectory
  assert(isDirectory, `${rpcPath} is not a directory!`)

  const client = new CLightningImpl(rpcPath)
  debug('Trying to connect to client')
  const info = await client.getInfo()
  debug('Succeeded!')
  debug('getinfo output: %o', info)
  return client
}
