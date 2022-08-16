# Changelog

## 0.2.0

### Added

-   Expose a JSON-RPC client, using the wallet's current JSON-RPC server.
-   `getSelectedAccount` method, which allows dApps to get the current account with using `connect`.

### (Breaking) Changed

-   Updated API of sendTransaction and signMessage to require the account address.
-   Updated API to include an 'accountDisconnected' event.

## 0.1.1

-   sendTransaction can now take a 5th argument, which is the schema's version. This will allow V1 contract parameters to be serialized.

## 0.1.0

-   Initialized from the old browser-wallet-api-types package.
-   Added method for detecting the injected Concordium browser wallet API.
