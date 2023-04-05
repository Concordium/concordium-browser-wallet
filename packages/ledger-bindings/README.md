# Concordium Ledger bindings

This is a javascript/typescript library that provides bindings for the [Concordium ledger app](https://github.com/Concordium/concordium-ledger-app).

## Using the library

The Bindings exposes a react-specific context provider, which handles the state of the ledger device, and exposes a callback function and the current status.

To use the context, set up the provider outside the components that should have access to the context.

```
import { LedgerContext } from '@concordium/ledger-bindings/react';

...
return (<LedgerContext>
    {children}
</LedgerContext>)
```

Then when you need to access the context, add the following to the component:

```
import { useLedger } from '@concordium/ledger-bindings/react';
...
    const { submitHandler, isReady, status} = useLedger()
```

## Development

### Installing

See [installing](https://github.com/Concordium/concordium-browser-wallet/blob/main/README.md#installing) in repository root.

### Building

-   Run `yarn build` in the package root, which will output into the folder "lib".

## Test

Tests can be run with:

```
yarn test
```

## Release

Ensure the package is built correctly and then run:

```
yarn npm publish
```
