# Sponsored Transactions Web Application

The example project included in this repository serves as a working example of how to integrate sponsored transactions with smart contracts on the Concordium blockchain. This web app supports the following two flows with the browser wallet (or wallet connect):

-   Register a public key in the smart contract.
-   Compute the messageHash of a sponsored updateOperator transaction => Submit the signed sponsored transaction to the smart contract.
-   Mint an NFT to your wallet => Compute the messageHash of a sponsored transfer transaction => Submit the signed sponsored transaction to the smart contract.

The front-end interacts with the smart contract {index: 3853, subindex: 0} that has a similar logic to [this contract](https://github.com/Concordium/concordium-rust-smart-contracts/tree/main/examples/cis3-nft-sponsored-txs).

## Prerequisites

-   Browser wallet extension must be installed in Google Chrome and the Concordium testnet needs to be selected or a mobile wallet needs to be set up that supports wallet connect in order to view smart contract details or submit transactions.

## Installing

-   Run `yarn` in package root.
-   Run `yarn build:all` in package root. (You will see an `[ERROR] Could not resolve "@concordium/browser-wallet-api-helpers`.)
-   Run `yarn build:all` in package root. (The command needs to be run twice because the above package that this project depends on will be built during the first run.)

## Running the sponsored txs example

-   Run `yarn build` in a terminal in this folder.
-   Run `yarn start`.
-   Open URL logged in console (typically http://127.0.0.1:8080).

To have hot-reload (useful for development), do the following instead:

-   Run `yarn watch` in a terminal.
-   Run `yarn start` in another terminal.
-   Open URL logged in console (typically http://127.0.0.1:8080).

## Build and run the Docker image

To build the docker image run the following command:

```
docker build -t e_sealing_front_end:$PROJECT_VERSION .
```

e.g.

```
docker build -t e_sealing_front_end:3.0.0 .
```

To run the docker image run the following command:

```
docker run -it -d -p 8080:80 --name web e_sealing_front_end:$PROJECT_VERSION
```

e.g.

```
docker run -it -d -p 8080:80 --name web e_sealing_front_end:3.0.0
```

Open http://127.0.0.1:8080 in your browser.

Note: You can get the PROJECT_VERSION from the `package.json` file or with one of the following commands:

```
npm pkg get version
```

or

```
jq -r .version package.json
```
