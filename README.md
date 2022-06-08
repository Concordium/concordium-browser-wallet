# concordium-browser-wallet

This repository contains the implementation of the Concordium browser wallet, which is an extension for the chrome browser. It consists of 4 separate packages:

-   [browser-wallet](./packages/browser-wallet) is the actual extension installed in chrome.
-   [browser-wallet-api](./packages/browser-wallet-api) is the API injected into web pages, allowing easy integration with the extension.
-   [browser-wallet-api-types](./packages/browser-wallet-api-types) is types associated with the browser wallet api, which can be installed to add relevant types to the project. This is published as a package on NPM as [@concordium/browser-wallet-api-types](https://www.npmjs.com/package/@concordium/browser-wallet-api-types).
-   [browser-wallet-message-hub](./packages/browser-wallet-message-hub) is utilities used for internal communication between the separate contexts in the chrome extension.

## Installing

-   Clone repository
-   Install dependencies by running `yarn install`

## Development and building packages

Documentation for building, running a development workflow, and other processes specific to each package can be found in the README for the respective package.
