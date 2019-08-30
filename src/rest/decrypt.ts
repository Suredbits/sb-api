import CryptoJS from 'crypto-js'

/**
 * Trims any trailing zero bytes from the given
 * word array
 *
 * @param {CryptoJS.WordArray} words
 * @return {CryptoJS.WordArray}
 */
function trimWordArray(words: CryptoJS.WordArray): CryptoJS.WordArray {
  ;(words as any).clamp()
  return words
}

/**
 * Deserializes the given base64 into IV and
 * ciphertext
 *
 * @returns ciphertext and IV
 */
function deserializeEncrypted(encrypted: string): [CryptoJS.WordArray, CryptoJS.WordArray] {
  const deserialized = CryptoJS.enc.Base64.parse(encrypted)
  const hex: string = deserialized.toString(CryptoJS.enc.Hex)

  const deserializedIV = CryptoJS.enc.Hex.parse(
    hex.slice(0, 32) // first 16 bytes are IV
  )

  const deserializedCipherText = CryptoJS.enc.Hex.parse(hex.slice(32)) // rest is cipher text

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
