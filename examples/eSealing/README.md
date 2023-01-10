# wCCD web application

The example project included in this repository serves as a working example of how to integrate with smart contracts on the Concordium blockchain. This web app interacts with the wCCD protocol on testnet. The connected account can invoke the wrap/unwrap functions to observe the wCCD balance change of its account.

## Prerequisites

-   Browser wallet extension must be installed in google chrome and configured with testnet JSON-RPC, in order to view smart contract details or submit transactions.

## Installing

-   Run `yarn` in package root.

## Running the wCCD example

-   Run `yarn build` in a terminal in this folder.
-   Run `yarn start`.
-   Open URL logged in console (typically http://127.0.0.1:8080).

To have hot-reload (useful for development), do the following instead:

-   Run `yarn watch` in a terminal.
-   Run `yarn start` in another terminal.
-   Open URL logged in console (typically http://127.0.0.1:8080).

## Build and run the Docker image

To build the docker image run the following:

```
docker build -t wccd_front_end:$PROJECT_VERSION .
```

e.g.

```
docker build -t wccd_front_end:3.0.0 .
```

To run the docker image run the following:

```
docker run -it -d -p 8080:80 --name web wccd_front_end:$PROJECT_VERSION
```

e.g.

```
docker run -it -d -p 8080:80 --name web wccd_front_end:3.0.0
```

Open http://127.0.0.1:8080 in your browser.
