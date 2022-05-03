# concordium-browser-wallet

This repository contains the implementation of the Concordium browser wallet, which is an extension for the chrome browser. It consists of 3 separate packages:

-   [browser-wallet](./packages/browser-wallet) is the actual extension installed in chrome.
-   [browser-wallet-api](./packages/browser-wallet-api) is the API injected into web pages, allowing easy integration with the extension. This is published as a package on NPM.
-   [browser-wallet-message-hub](./packages/browser-wallet-message-hub) is utilities used for internal communication between the separate contexts in the chrome extension. This is published as a package on NPM.

## Installing

-   Clone repository
-   Install dependencies by running `yarn install`

## Development and building packages

Documentation for building, running a development workflow, and other processes specific to each package can be found in the README for the respective package.
