[![npm version](https://badge.fury.io/js/sb-api.svg)](https://badge.fury.io/js/sb-api)
[![Build Status](https://travis-ci.org/Suredbits/sb-api.svg?branch=master)](https://travis-ci.org/Suredbits/sb-api)

<!-- h1 instead of # to avoid TOC including header -->
<h1>JS/TS client library for Suredbits APIs</h1>

This is a client library for interacting with the Suredbits APIs for NFL, NBA and cryptocurrency market data. See our [API docs](https://suredbits.com/api) for more information.

You're also welcome to join our [Slack](https://join.slack.com/t/suredbits/shared_invite/enQtNDEyMjY3MTg1MTg3LTYyYjkwOGUzMDQ4NDAwZjE1M2I3MmQyNWNlZjNlYjg4OGRjYTRjNWUwNjRjNjg4Y2NjZjAxYjU1N2JjMTU1YWM), if you have any questions about our APIs, our open source Bitcoin library [Bitcoin-S](https://github.com/bitcoin-s/bitcoin-s-core) or just want to discuss Bitcoin, Lightning, NBA & NFL or anything else.

- [Add it to your project:](#add-it-to-your-project)
    - [Yarn](#yarn)
    - [npm](#npm)
- [Usage:](#usage)
  - [Setting up the connection](#setting-up-the-connection)
    - [Eclair](#eclair)
    - [LND](#lnd)
    - [`c-lightning`](#c-lightning)
  - [Request data from REST APIs](#request-data-from-rest-apis)
  - [Request data from socket based APIs](#request-data-from-socket-based-apis)
  - [Types](#types)
- [Debug logging](#debug-logging)
- [Utilities](#utilities)
- [Publishing](#publishing)
- [Testing](#testing)

## Add it to your project:

#### Yarn

```bash
$ yarn add sb-api
```

#### npm

```bash
$ npm install --save sb-api
```

## Usage:

### Setting up the connection

Our APIs are paid for by using the Bitcoin Lightning Network. We suport the major Lightning implementations: [`lnd`](https://github.com/lightningnetwork/lnd), [`c-lightning`](https://github.com/ElementsProject/lightning) and [Eclair](https://github.com/acinq/eclair).

We assume you have a running Lightning client. Behind the scenes it does two things with the provided client:

1. Pay invoices. We pay for access to the Suredbits` APIs by paying Lightning invoices.
1. Generate invoices without an amount specified. When setting up a subscription we provide a refund invoice where money can be refunded to us if we abort or subscription before it's up or something causes the server to abort the subscription.

You should not keep large amounts of money on the node you're using with this library.

#### Eclair

```typescript
import { Eclair, Sockets } from 'sb-api'

const eclair = await Eclair({ rpcPass: 'super_secret' })
const futuresSocket = await Sockets.exchangeSpot(eclair)
```

#### LND

```typescript
import { Lnd, Sockets } from 'sb-api'

const lnd = await Lnd()
// You then pass lnd into the appropriate socket/REST API you're interested in.
```

#### `c-lightning`

```typescript
import { CLightning } from 'sb-api'

const client = await CLightning()

// You then pass client into the appropriate socket/REST API you're interested in.
```

See [`doc/ln-clients.md`](doc/ln-clients.md) for more information on how to use your favorite LN implementation, and what the available options are.

### Request data from REST APIs

We provide REST APIs for data that are not realtime-based (such as
historical market data). These functions are regular promises
that can call `.then` or `await` on. Behind the scenes we make a HTTP
request, pay the accompanying invoice and then use the preimage of the
invoice to decrypt the received data.

```typescript
const lnd = await Lnd()

const historicalRest = HistoricalRestAPI(lnd)

const historicalResponse = await historicalRest.call({
  exchange: 'bitstamp',
  pair: 'BTCUSD',
  period: 'daily',
  year: 2018,
})

const nflRest = NflRestAPI(lnd)

const nflResponse = await nflRest.players({
  firstName: 'Colin',
  lastName: 'Kaepernick',
})
```

### Request data from socket based APIs

We provide streaming realtime data over WebSockets. These APIs require you
to specify callbacks (functions) that gets executed whenever certain events
happen. Note that if you're using TypeScript, the callbacks are fully
typed, with inferred types from the exchange you're requesting data from.

```typescript
import { Lnd, Sockets } from 'sb-api'

const ln = await Lnd()
const spot = await Sockets.exchangeSpot(ln)
spot.tickers({
  duration: 10000,
  exchange: 'binance',
  // data has types! data.bidSize works, data.wrongField gives an error
  onData: data => console.log('received some data:', data),
  // snap has types! snap.map(s => handleS(s)) works, snap.wrongField gives an error
  onSnapshot: snap => console.log('received a snapshot:', snap),
  // this callback is called at the end of your subscription, and provides
  // you with a list of all the elements you've received
  onSubscriptionEnded: datapoints => datapoints[0],
  refundInvoice,
})

// the comments above on the callbacks used for the spot socket
// also apply for the futures socket

const futures = await Sockets.exchangeFutures(ln)
futures.trades({
  exchange: 'bitmex',
  symbol: 'BTCUSD',
  interval: 'biquarterly',
  onData: data => data,
  onSnapshot: snap => snap[0],
  onSubscriptionEnded: datapoints => datapoints[0],
  duration: 20000,
})

const nbaSocket = await Sockets.nbaTestnet()
const dalRoster = await nbaSocket.roster({ teamId: 'DAL' })
```

See our [API docs](https://suredbits.com/api) for complete code samples for making requests, as well as what responses look like, for all API endpoints and request types.

### Types

We recommend using TypeScript with this library. It has excellent type support built in, as it's written in TypeScript. When using TS you'll have all parameters passed to your requests type checked. The data type of the argument in `onData` or `onSnapshot` in a exchange socket will also change based on which exchange and which data type (tickers, books or trades) you request.

## Debug logging

This library uses the [`debug`](https://www.npmjs.com/package/debug) module for logging what's going on. `debug` logs using what it calls namespaces. This library logs under the following namespaces:

- `sb-abi:lightning:lnd` - LND related functionality
- `sb-api:lightning:eclair` - Eclair related functionality
- `sb-api:lightning:clightning` - `c-lightning` related functionality
- `sb-api:socket:base` - functionality common for all sockets
- `sb-api:socket:ppc` - functionality common for pay-per-call sockets (NBA)
- `sb-api:socket:exchange` - crypto market data logging
- `sb-api:validation` - logs the validation of incoming data from the API
- `sb-api:rest` - logs queries and responses to the Suredbits REST APIs

To activate logging output for a given namespace you need to set the `DEBUG` environment variable. Namespaces are hierarchically organized with `:` as the level separator. It's possible to specify multiple namespaces by comma-separating them. `DEBUG=sb-api:*` causes all namespaces to get logged. Setting `DEBUG` to `sb-api:socket:*` activates the `sb-api:socket:base`, `sb-api:socket:ppc` and `sb-api:socket:exchange` namespaces.

`DEBUG=sb-api:lightning:*,sb-api:socket:base,sb-api:socket:ppc` would enable logging of all Lightning activity, the functionality common for all sockets and the functionality common for pay-per-call sockets (NBA).

## Utilities

The script `decrypt.ts` is provided as a utility script for decrypting payloads adhering
to the PAID standard.
Usage: `npx ts-node -T decrypt.ts $encrypted_payload $invoice_preimage`.

## Publishing

```
$ yarn publish
```

Lints, checks formatting, makes new git tag, pushes new git tag, build, pushes build to npm

## Testing

When testing this library, you need two secret environment variables, `MAGIC_UUID` and `MAGIC_PREIMAGE`. After that, simply do:

```bash
$ env MAGIC_UUID=... MAGIC_PREIMAGE=... yarn test --your --options --to --jest --here
```
