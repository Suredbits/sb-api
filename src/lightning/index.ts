export interface LightningApi {
  /**
   * Pay a lightning invoice
   */
  send: (invoice: string) => Promise<any>

  /**
   * Generate a lightning invoice without amount specified,
   * optional description
   */
  receive: (description?: string) => Promise<string>

  /** Gets the preimage associated with the given invoice.
   * Fails if the invoice isn't paid.
   */
  getPreimage: (invoice: string) => Promise<string>

  /**
   * Verify that we're communicating with the client
   * properly
   */
  getInfo: () => Promise<any>
}

export { Eclair } from './eclair'
export { CLightning } from './clightning'
export { Lnd } from './lnd'

export type BitcoinNetwork = typeof BitcoinNetwork[keyof typeof BitcoinNetwork] | never

export const BitcoinNetwork = {
  testnet: 'testnet',
  mainnet: 'mainnet',
} as const
