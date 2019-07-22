import CryptoJS from 'crypto-js'

/**
 * Trims any trailing zero bytes from the given
 * word array
 *
 * @param {CryptoJS.WordArray} words
 * @return {CryptoJS.WordArray}
 */
function trimWordArray(words: CryptoJS.WordArray): CryptoJS.WordArray {
  const hex = words.toString(CryptoJS.enc.Hex)

  const lastNonZero = hex.length - [...hex.split('')].reverse().findIndex(char => char !== '0')

  const trimmedHex = hex.slice(0, lastNonZero === 0 ? undefined : lastNonZero)
  return CryptoJS.enc.Hex.parse(trimmedHex)
}

/**
 * Deserializes the given base64 into IV and
 * ciphertext
 *
 * @returns ciphertext and IV
 */
function deserializeEncrypted(encrypted: string): [CryptoJS.WordArray, CryptoJS.WordArray] {
  const deserialized = CryptoJS.enc.Base64.parse(encrypted)
  const deserializedIV = CryptoJS.lib.WordArray.create(
    deserialized.words.slice(0, 4) // each word is 4 bytes
  )

  const deserializedCipherText = CryptoJS.lib.WordArray.create(deserialized.words.slice(4))

  return [trimWordArray(deserializedCipherText as any), deserializedIV as any]
}

/**
 * @param {string} base64 Base64 encoded IV and ciphertext
 * @param {string} preimage hex string of the preimage
 * @param {string} publicKey hex string of the public key
 */
export function decrypt(base64: string, preimage: string): string {
  const preimageByteLength = preimage.length / 2
  if ([16, 24, 32].every(l => preimageByteLength !== l)) {
    throw new TypeError(`The given preimage is ${preimageByteLength} bytes long! Valid lengths: 16, 24, 32`)
  }

  const parsedPreimage = CryptoJS.enc.Hex.parse(preimage)

  const [ciphertext, IV] = deserializeEncrypted(base64)
  const decrypted = CryptoJS.AES.decrypt({ ciphertext } as any, parsedPreimage, {
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding,
    iv: IV,
  } as any)

  return decrypted.toString(CryptoJS.enc.Utf8)
}
