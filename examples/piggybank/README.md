# Piggy bank web application

The example project included in this repository, serves as a working example of how to integrate with smart contracts on the Concordium blockchain.
It both includes a page for a V0 and a V1 version of the piggy bank smart contract.

## Prerequisites

### Viewing smart contract details

-   [JSON-RPC server](https://github.com/Concordium/concordium-json-rpc/tree/add-get-instance-info) connected to testnet node is accessible at http://127.0.0.1:9095.
    -   Note that currently the JSON-RPC server must be built from the branch "add-get-instance-info" (link above already targets this branch)

### Submitting transactions

-   Browser wallet extension is installed in google chrome and configured with testnet JSON-RPC.

## Installing

-   Run `yarn` in package root.

## Running the example

-   Run `yarn watch` in a terminal
-   Run `yarn start` in another terminal
-   Open URL logged in console (typically http://127.0.0.1:8080)
