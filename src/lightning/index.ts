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
}

export { Eclair } from './eclair'

export const enum BitcoinNetwork {
  testnet = 'testnet',
  mainnet = 'mainnet',
}
