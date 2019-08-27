import makeDebug from 'debug'
import * as t from 'io-ts'
import request from 'request-promise-native'
import { LightningApi } from '../lightning'
import { RestValidate } from '../types'
import { decrypt } from './decrypt'

const EncryptedRestResponse = t.type({
  invoice: t.string,
  encryptedData: t.string,
})

type EncryptedRestResponse = t.TypeOf<typeof EncryptedRestResponse>
const debug = makeDebug('sb-api:rest')
export const makeRestRequest = async <T, O = T>(ln: LightningApi, path: string, type: t.Type<T, O>): Promise<T> => {
  debug(`Sending GET request to %O`, path)
  const response = await request.get(path).catch(err => {
    debug(`Error when connecting to API at ${path}: %O`, err)
    throw err
  })

  const encrypted = RestValidate.data(JSON.parse(response), EncryptedRestResponse)

  await ln.send(encrypted.invoice)

  const preimage = await ln.getPreimage(encrypted.invoice)
  const decrypted = decrypt(encrypted.encryptedData, preimage)

  const validated = RestValidate.data(JSON.parse(decrypted), type)

  return validated
}
