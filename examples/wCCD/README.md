# wCCD web application

The example project included in this repository serves as a working example of how to integrate with smart contracts on the Concordium blockchain. This web app interacts with the wCCD protocol on testnet. The connected account can invoke the wrap/unwrap functions to observe the wCCD balance change of its account.

## Prerequisites

-   Browser wallet extension must be installed in google chrome and configured with testnet JSON-RPC, in order to view smart contract details or submit transactions.

## Installing

-   Run `yarn` in package root.
-   Run `yarn build:all` to build the `concordium-helpers` package.

## Running the wCCD example

-   Run `yarn build` in a terminal in this folder.
-   Run `yarn start`.
-   Open URL logged in console (typically http://127.0.0.1:8080).

To have hot-reload (useful for development), do the following instead:

-   Run `yarn watch` in a terminal.
-   Run `yarn start` in another terminal.
-   Open URL logged in console (typically http://127.0.0.1:8080).
