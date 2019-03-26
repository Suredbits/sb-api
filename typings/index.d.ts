declare module 'lnd-async' {
  export function connect(args?: any): Promise<any>
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

    public getinfo: () => Promise<any>
  }
}
