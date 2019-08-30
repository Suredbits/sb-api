// tslint:disable: no-console

import makeDebug from 'debug'

const debug = makeDebug('sb-api')
debug.enabled = true

import { BitcoinNetwork, Eclair, HistoricalRestAPI } from './src'

debug('=====================================================================')
debug('THIS SCRIPT IS MENT FOR DEVELOPMENT PURPOSES ONLY')
debug('IF THIS GOT INCLUDED IN THE PUBLISHED LIBRARY, SOMETHING BAD HAPPENED')
debug('=====================================================================')

async function main() {
  const eclair = await Eclair({ rpcPass: 'abc123' })
  const rest = HistoricalRestAPI(eclair)
  const response = await rest.call({
    exchange: 'kraken',
    pair: 'ETHUSD',
    period: 'daily',
    year: 2019,
    network: BitcoinNetwork.mainnet,
  })
  console.log('response', response)
}

main().catch(err => {
  console.error(`Error: ${err}`)
  process.exit(1)
})
