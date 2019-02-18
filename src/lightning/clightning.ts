import assert from 'assert'
import makeDebug from 'debug'
import fsCb from 'fs'
import LightningClient from 'lightning-client'
import os from 'os'
import path from 'path'
import util from 'util'
import uuid from 'uuid'

import { LightningApi } from '.'

const debug = makeDebug('lightning:clightning')
const lstat = util.promisify(fsCb.lstat)

export interface CLightning extends LightningApi {}

class CLightningImpl implements LightningApi {
  private client: LightningClient
  public constructor(rpcPath: string) {
    debug(`Connecting to c-lightning with rpcPath ${rpcPath}`)
    this.client = new LightningClient(rpcPath)
  }

  public receive = (description: string = ''): Promise<string> => {
    const uniqueLabel = uuid() // c-lightning requires all invoice labels to be unique

    // c-lightning expects the string 'any' to make an invoice without amount specified
    const amountMsat = 'any'

    return this.client.invoice(amountMsat, uniqueLabel, description).then(({ bolt11 }) => bolt11)
  }

  public send = (invoice: string): Promise<any> => this.client.pay(invoice)

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
