import makeDebug from 'debug'
import lnd, { ConnectArgs, LndClient } from 'lnd-async'

import { LightningApi } from '.'

const debug = makeDebug('lightning:lnd')

export interface Lnd extends LightningApi {}

class LndImpl implements LightningApi {
  public constructor(private lndClient: LndClient) {}

  public receive = (description?: string): Promise<string> => {
    debug('Generating invoice')
    return this.lndClient.addInvoice({ memo: description }).then(({ payment_request }) => payment_request)
  }

  public send = (invoice: string): Promise<any> => {
    debug(`Paying invoice ${invoice.slice(0, 25)}...`)
    return this.lndClient.sendPaymentSync({ payment_request: invoice })
  }

  public getInfo = (): Promise<any> => this.lndClient.getInfo({})
}

export const Lnd = async (args?: ConnectArgs): Promise<Lnd> => {
  debug('Trying to connect to LND')
  const client = await lnd.connect(args)
  debug('Succeeded!')
  debug('Trying a getInfo call')
  const info = await client.getInfo({})
  debug('Succeeded!')
  debug('getInfo output: %o', info)
  return new LndImpl(client)
}
