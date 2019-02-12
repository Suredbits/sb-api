# Available Lightning clients

- [Available Lightning clients](#available-lightning-clients)
  - [LND](#lnd)
  - [`c-lightning`](#c-lightning)
  - [Eclair](#eclair)

## LND

We use the library [`lnd-async`](https://github.com/altangent/lnd-async) to interact with LND. It is maintained by [Altangent Labs](https://github.com/altangent).

```typescript
import { Lnd } from 'sb-api'

const client = await Lnd({ macaroonPath: '/home/satoshi/.lnd/data/chain/bitcoin/testnet/admin.macaroon' })

// You then pass client into the appropriate socket you're interested in.
```

The `Lnd` function takes in an optional object of options. The available options are:

- `lndHost` - optional, defaults to `localhost`. Could also be a remote LND server.
- `lndPort` - optional, defaults to `10009`
- `certPath` - optional, defaults to `tls.cert` in your OS' default LND data directory
- `macaroonPath` - optional, tries to default to `admin.macaroon` in the correct network (testnet or mainnet) folder in your OS' default data directory for LND.
- `macaroon` - optional, no default. The macaroon used for authenticating with LND as a base64 encoded string.
- `cert` - optional, no default. The certificate used for authenticating with LND as a base64 encoded string.
- `noMacaroons` - optiona, defaults to `false`. If this option is enabled all macaroon handling is skipped. Note that this requires you to have LND set up in the same way. **This is very insecure.**

## `c-lightning`

We use the library [`lightning-client`](https://github.com/BHBNETWORK/lightning-client-js) to interact with `c-lightning`. It is maintained by [BHB NETWORK](https://twitter.com/BHBnetwork).

```typescript
import { CLightning } from 'sb-api'

const client = await CLightning('/home/satoshi/.lightning')

// You then pass client into the appropriate socket you're interested in.
```

The `CLightning` function takes in only one parameter, the data directory path of your `c-lightning` installation. It defaults to `$HOME/.lightning`.

## Eclair

Eclair exposes a simple HTTP RPC interface, and we use that directly with no library in between. The code that manages our connection to Eclair can be found in [`src/lightning/eclair.ts`](../src/lightning/eclair.ts)

```typescript
import { Eclair } from 'sb-api'

const client = await Eclair({ rpcPass: 'secret' })

// You then pass client into the appropriate socket you're interested in.
```

The `Eclair` function takes in an object of options. The available options are:

- `rpcPass` - Password to the Eclair RPC server. The only required argument.
- `host` - optional, defaults to `localhost`. Could also be a remote Eclair server. Note that communication is sent over unsecured HTTP, and should therefore only happen over local addresses.
- `port` - optional, defualts to `8080`. The port that we should send HTTP requests to
