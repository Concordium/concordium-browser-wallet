# concordium-browser-wallet

This repository contains the implementation of the Concordium browser wallet, which is an extension for the chrome browser. It consists of 4 separate packages:

-   [browser-wallet](./packages/browser-wallet) is the actual extension installed in chrome.
-   [browser-wallet-api](./packages/browser-wallet-api) is the API injected into web pages, allowing easy integration with the extension.
-   [browser-wallet-api-helpers](./packages/browser-wallet-api-helpers) is types and helper methods associated with the browser wallet api, which can be installed in projects that want to utilize the browser wallet API. This is published as a package on NPM as [@concordium/browser-wallet-api-helpers](https://www.npmjs.com/package/@concordium/browser-wallet-api-helpers).
-   [browser-wallet-message-hub](./packages/browser-wallet-message-hub) is utilities used for internal communication between the separate contexts in the chrome extension.

-   [examples](./examples), a collection of example dapps that can be used with the browser wallet.

## Installing

### Prerequisites

-   Node.js version 18.14.2
-   Typescript installed globally `npm -g install typescript` (Used for running the post install script of wallet-common-helpers during `yarn install`)
-   Yarn installed globally `npm -g install yarn` (The repository embeds yarn 3.2.0, but needs a global version for easy usage)

### Setup

-   Clone repository
-   Install dependencies by running `yarn install`
-   Build concordium api helpers by running `yarn build:api-helpers` (The wallet and examples require this package to be built, before they can be built)

The primary package is the [browser-wallet](./packages/browser-wallet) package, which builds the final artifact.
Please check out [README for that package](.packages/browser-wallet/README.md) to see how to built it for development.
To build the extension for release, use the "Release browser wallet" action.

## Development and building packages

Documentation for building, running a development workflow, and other processes specific to each package can be found in the README for the respective package.

There is also the `yarn build:all` command availabe which can be run after installing the dependencies, to build the wallet and all examples.

## Generating license attributions

From the base directory run:

```
yarn generate-disclaimer
```

You must manually remove the internal license dependencies before publishing it to the documentation in https://github.com/Concordium/concordium.github.io.
