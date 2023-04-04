# concordium-browser-wallet

This repository contains the implementation of the Concordium browser wallet, which is an extension for the chrome browser. It consists of 4 separate packages:

-   [browser-wallet](./packages/browser-wallet) is the actual extension installed in chrome.
-   [browser-wallet-api](./packages/browser-wallet-api) is the API injected into web pages, allowing easy integration with the extension.
-   [browser-wallet-api-helpers](./packages/browser-wallet-api-helpers) is types and helper methods associated with the browser wallet api, which can be installed in projects that want to utilize the browser wallet API. This is published as a package on NPM as [@concordium/browser-wallet-api-helpers](https://www.npmjs.com/package/@concordium/browser-wallet-api-helpers).
-   [browser-wallet-message-hub](./packages/browser-wallet-message-hub) is utilities used for internal communication between the separate contexts in the chrome extension.
-   [ledger-bindings](./packages/ledger-bindings) contains bindings to communicate with the `concordium ledger app` on a LEDGER device.

The repository also contains a number of examples of dApps which communicate with the wallet. These are found in the `examples` folder.

## Installing

-   Clone repository
-   Install dependencies by running `yarn install`

## Development and building packages

Documentation for building, running a development workflow, and other processes specific to each package can be found in the README for the respective package.

## Generating license attributions

From the base directory run:

```
yarn generate-disclaimer
```

You must manually remove the internal license dependencies before publishing it to the documentation in https://github.com/Concordium/concordium.github.io.
