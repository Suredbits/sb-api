import { decrypt } from './src/rest/decrypt'

// tslint:disable: no-console

console.error('=========================================')
console.error('THIS SCRIPT IS USED FOR DEV PURPOSES ONLY')
console.error("IF YOU'RE SEEING THIS AS AN END USER,")
console.error('SOMETHING WENT WRONG')
console.error('=========================================')

function usage(): never {
  console.error('Usage: npx ts-node -T encrypted preimage')
  console.error('           Decrypted JSON gets printed to')
  console.error('           stdout, so this script can be')
  console.error('           piped into jq')
  return process.exit(1)
}

const [exec, program, encrypted, preimage, ...rest] = process.argv

if (!encrypted || !preimage) {
  usage()
}

console.error('Encrypted:', encrypted)
console.error('Preimage:', preimage)

try {
  const decrypted = decrypt(encrypted, preimage)
  console.info(decrypted)
} catch (err) {
  console.error('Error when decrypting:', (err as Error).message)
}
