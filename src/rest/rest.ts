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
  const uuidFromEnv = process.env.MAGIC_UUID
  const pathWithUUID = uuidFromEnv ? path + `?uuid=${encodeURIComponent(uuidFromEnv)}` : path
  const response = await request.get(pathWithUUID).catch(err => {
    debug(`Error when connecting to API at ${path}: %s`, err)
    throw err
  })

  const encrypted = RestValidate.data(JSON.parse(response), EncryptedRestResponse)

  await ln.send(encrypted.invoice)

  const preimage = await ln.getPreimage(encrypted.invoice)
  let decrypted: string
  try {
    decrypted = decrypt(encrypted.encryptedData, preimage)
  } catch (err) {
    const oldDebugValue = debug.enabled
    if (process.env.NODE_ENV === 'test') {
      debug.enabled = true
    }

    debug(`Error when decrypting result of GET ${path}: %O`, err)
    debug('This happened when decrypting this payload: %O', encrypted.encryptedData)

    debug.enabled = oldDebugValue
    throw err
  }

  let parsed: object
  try {
    parsed = JSON.parse(decrypted)
  } catch (err) {
    const oldDebugValue = debug.enabled
    if (process.env.NODE_ENV === 'test') {
      debug.enabled = true
    }

    debug(`Error when parsing result of GET ${path}: %O`, err)
    debug('This happened when parsing this text: %O', decrypted)

    debug.enabled = oldDebugValue

    throw err
  }
  const validated = RestValidate.data(parsed, type)

  return validated
}
