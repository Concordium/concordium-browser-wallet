# Piggy bank web application

The example project included in this repository, serves as a working example of how to integrate with smart contracts on the Concordium blockchain.

## Prerequisites

-   Web app assumes JSON-RPC server connected to testnet node is accessible at http://127.0.0.1:9095.
    -   Currently must be built from the branch "add-get-instance-info"
-   Browser wallet extension is installed in google chrome and configured with testnet JSON-RPC.
    -   Must be running with command line arg --disable-web-security due to CORS restrictions

## Running the example

-   Run `yarn` in package root.
-   Run `yarn watch`
-   Open URL logged in console (typically http://127.0.0.1:8080)
