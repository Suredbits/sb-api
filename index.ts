import makeDebug from 'debug'

const debug = makeDebug('sb-api')
debug.enabled = true

import { BitcoinNetwork, Eclair, HistoricalRestAPI } from './src'

debug('=====================================================================')
debug('THIS SCRIPT IS MENT FOR DEVELOPMENT PURPOSES ONLY')
debug('IF THIS GOT INCLUDED IN THE PUBLISHED LIBRARY, SOMETHING BAD HAPPENED')
debug('=====================================================================')

async function main() {
  const eclair = await Eclair({ rpcPass: '%foobar$' })

  const rest = HistoricalRestAPI(eclair)

  const response = await rest.call({
    exchange: 'bitstamp',
    pair: 'BTCUSD',
    period: 'daily',
    year: 2018,
    network: BitcoinNetwork.testnet,
  })

  console.log('response', response)
}

main()
