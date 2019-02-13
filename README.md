[![npm version](https://badge.fury.io/js/sb-api.svg)](https://badge.fury.io/js/sb-api)
<!-- h1 instead of # to avoid TOC including header -->
<h1>JS/TS client library for Suredbits APIs</h1>

This is a client library for interacting with the Suredbits APIs for NFL, NBA and cryptocurrency market data. See our [API docs](https://suredbits.com/api) for more information.

You're also welcome to join our [Slack]( https://join.slack.com/t/suredbits/shared_invite/enQtNDEyMjY3MTg1MTg3LTYyYjkwOGUzMDQ4NDAwZjE1M2I3MmQyNWNlZjNlYjg4OGRjYTRjNWUwNjRjNjg4Y2NjZjAxYjU1N2JjMTU1YWM ), if you have any questions about our APIs, our open source Bitcoin library [Bitcoin-S](https://github.com/bitcoin-s/bitcoin-s-core) or just want to discuss Bitcoin, Lightning, NBA & NFL or anything else.

- [Add it to your project:](#add-it-to-your-project)
    - [Yarn](#yarn)
    - [npm](#npm)
- [Usage:](#usage)
  - [Setting up the connection](#setting-up-the-connection)
    - [Eclair](#eclair)
    - [LND](#lnd)
    - [`c-lightning`](#c-lightning)
  - [Request data](#request-data)
  - [Types](#types)
- [Debug logging](#debug-logging)

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
const refundInvoice = await eclair.receive()
const exchangeSocket = await Sockets.exchangeTestnet(eclair)
```

#### LND

```typescript
import { Lnd, Sockets } from 'sb-api'

const lnd = await Lnd()
const refundInvoice = await lnd.receive()
const exchangeSocket = await Sockets.exchangeTestnet(lnd)
```

#### `c-lightning`

```typescript
import { CLightning } from 'sb-api'

const client = await CLightning()

// You then pass client into the appropriate socket you're interested in.
```

See [`doc/ln-clients.md`](doc/ln-clients.md) for more information on how to use your favorite LN implementation, and what the available options are.

### Request data

```typescript
import { Lnd, Sockets } from 'sb-api'

const ln = await Lnd()
const exchangeSocket = await Sockets.exchangeTestnet()
exchangeSocket.tickers({
  duration: 10000,
  exchange: 'binance',
  // data has types! data.bidSize works, data.wrongField gives an error
  onData: data => console.log('received some data:', data),
  // snap has types! snap.map(s => handleS(s)) works, snap.wrongField gives an error
  onSnapshot: snap => console.log('received a snapshot:', snap),
  refundInvoice,
})

const nflSocket = await Sockets.nflTestnet()
const cleRoster = await nflSocket.roster({ teamId: 'CLE' })

const nbaSocket = await Sockets.nbaTestnet()
const dalRoster = await nbaSocket.roster({ teamId: 'DAL' })
```

See our [API docs](https://suredbits.com/api) for complete code samples for making requests, as well as what responses look like, for all API endpoints and request types. 

### Types

We recommend using TypeScript with this library. It has excellent type support built in, as it's written in TypeScript. When using TS you'll have all parameters passed to your requests type checked. The data type of the argument in `onData` or `onSnapshot` in a exchange socket will also change based on which exchange and which data type (tickers, books or trades) you request.

## Debug logging

This library uses the [`debug`](https://www.npmjs.com/package/debug) module for logging what's going on. `debug` logs using what it calls namespaces. This library logs under the following namespace:

- `lightning:lnd` - LND related functionality
- `lightning:eclair` - Eclair related functionality
- `lightning:clightning` - `c-lightning` related functionality
- `socket:base` - functionality common for all sockets
- `socket:ppc` - functionality common for pay-per-call sockets (NBA & NFL)
- `socket:exchange` - crypto market data logging
- `validation` - logs the validation of incoming data from the API

To activate logging output for a given namespace you need to set the `DEBUG` environment variable. Namespaces are hierarchically organized with `:` as the level separator. It's possible to specify multiple namespaces by comma-separating them. `DEBUG=*` causes all namespaces to get logged. Setting `DEBUG` to `socket:*` activates the `socket:base`, `socket:ppc` and `socket:exchange` namespaces.

`DEBUG=lightning:*,socket:base,socket:ppc` would enabling logging of all Lightning activity, the functionality common for all sockets and the functionality common for pay-per-call sockets (NBA & NFL).
