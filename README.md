> This library is still a WIP, and not available on npm. Don't use it yet, official launch is in a couple of days.

# JS/TS client library for Suredbits APIs

This is a client library for interactig with the Suredbits APIs for NFL, NBA and cryptocurrency market data. See our [API docs](https://suredbits.com/api) for more information.

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
const exchangeSocket = await Sockets.exchangeTestnet(eclair)
```

#### `c-lightning`

```typescript
// TODO
```

### Request data

```typescript
import { Eclair, Sockets } from 'sb-api'

const ln = Ecliar({ rpcPass: 'secret' })
const exchangeSocket = Sockets.exchangeTestnet
exchangeSocket.tickers({
  duration: 10000,
  exchange: 'binance',
  // data has types! data.bidSize works, data.wrongField gives an error
  onData: data => console.log('received some data:', data),
  // snap has types! snap.map(s => handleS(s)) works, snap.wrongField gives an error
  onSnapshot: snap => console.log('received a snapshot:', snap),
  refundInvoice,
})

const nflSocket = Sockets.nflTestnet
nflSocket.roster({ teamId: 'CLE' })

const nbaSocket = Sockets.nbaTestnet
nbaSocket.roster({ teamId: 'DAL' })
```

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

To activate logging output for a given namespace you need to set the `DEBUG` environment variable. Namespaces are hierarchically organized with `:` as the level separator. So setting `DEBUG` to `socket` activates the `socket:base`, `socket:ppc` and `socket:exchange` namespaces. It's possible to specify multiple namespaces by comma-separating them. `DEBUG=*` causes all namespaces to get logged.

`DEBUG=lightning,socket:base,socket:ppc` would enabling logging of all Lightning activity, the functionality common for all sockets and the functionality common for pay-per-call sockets (NBA & NFL).
