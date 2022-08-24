# wCCD web application

The example project included in this repository serves as a working example of how to integrate with smart contracts on the Concordium blockchain. This web app interacts with the wCCD protocol on testnet. The connected account can invoke the wrap/unwrap functions to observe the wCCD balance change of its account as well as observe the CCD balance on the wCCD proxy.

## Prerequisites

-   Browser wallet extension must be installed in google chrome and configured with testnet JSON-RPC, in order to view smart contract details or submit transactions.

## Installing

-   Run `yarn` in package root.

## Running the example

-   Run `yarn watch` in a terminal
-   Run `yarn start` in another terminal
-   Open URL logged in console (typically http://127.0.0.1:8080)
