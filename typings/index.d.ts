declare module 'lnd-async' {
  export interface LndClient {
    sendPaymentSync: (args: { payment_request: string }) => Promise<any>
    addInvoice: (args: { memo?: string }) => Promise<any>
  }

  export interface ConnectArgs {
    lndHost?: string
    lndPort?: number
    noMacaroons?: boolean

    certPath?: string
    macaroonPath?: string

    cert?: string
    macaroon?: string
  }

  export function connect(args?: ConnectArgs): Promise<LndClient>
}

declare module 'lightning-client' {
  export default class LightningClient {
    public constructor(rpcPath: string, debugMode?: boolean)

    public invoice: (
      msat: number | 'any',
      label: string,
      description: string,
      expiry?: number
    ) => Promise<{ payment_hash: string; expires_at: number; bolt11: string; warning_capacity?: string }>

    public pay: (
      invoice: string
    ) => Promise<{
      id: number
      payment_hash: string
      destination: string
      msatoshis: number
      msatoshis_sent: number
      created_at: number
      status: string
      payment_preimage: string
    }>
  }
}
