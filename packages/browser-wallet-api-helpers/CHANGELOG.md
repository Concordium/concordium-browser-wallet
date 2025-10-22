# Changelog

## 3.0.2

### Updated

-   Updated handler `sendTransaction` with new payload type `TokenUpdatePayload`

## 3.0.1

### Fixed

-   Extend type `SmartContractParameters` with `bigint` allowing large numbers in smart contract parameters.

## 3.0.0

### Breaking changes

-   Removed `getGrpcClient`. As an alternative, `grpcTransport` can be used with `ConcordiumGRPCClient` from `@concordium/web-sdk`.
-   Make dependency to `@concordium/web-sdk` a peer dependency (^7.0).
    This will require consuming apps to add an explicit dependency to the library with its own version constraints.

### Added

-   `grpcTransport` getter for getting a gprc transport layer for constructing a GRPC client which uses the node settings from the wallet.

## 2.8.0

### Fixed

-   `requestAccounts` no longer appears to be able to return undefined.

## 2.7.0

### Changed

-   Bumped version of @concordium/web-sdk to 6.3.0.

## 2.6.0

### Added

-   `requestAccounts` entrypoint to connect to a list of accounts.
-   `addWeb3IdCredential` entrypoint to add verifiable credentials.
-   `requestVerifiablePresentation`entrypoint to prove statements about identities and verifiable credentials.

## 2.5.1

### Changed

-   Made it possible to define the `type` of `SchemaWithContext` as a string along with the existing `SchemaType` enum.

## 2.5.0

### Added

-   Added `getGrpcClient` entrypoint to access grpc-web client.
-   Added `getSelectedChain` entrypoint to get the genesis hash of the chain selected in the wallet.

### Deprecated

-   `getJsonRpcClient` in favor of the new `getGrpcClient`.

## 2.4.0

### Added

-   signMessage is now able to receive a SignMessageObject as the message in addition to a utf8 string.

## 2.3.0

### Added

-   Added section for `requestIdProof` to README.

### Fixed

-   Type for smart contract parameters in sendTransaction.

## 2.2.0

### Added

-   SendTransaction for smart contract transactions can receive schemas that are for the specific parameter. If the raw schema is given directly, it is assumed to be the schema of the module, like previously.

## 2.1.0

### Added

-   Entrypoint to request zero knowledge proof for a list of statements.

## 2.0.0

### Added

-   Entrypoint to suggest CIS-2 tokens to be added to the connected account's view.

### (Breaking) Changed

-   Updated web-sdk to version 3, which changes field names in some transaction payloads for sendTransaction entrypoint.

## 1.0.0

### Changed

-   Fixed broken link + typos in README
-   Removed parameters from smart contract types' payloads, due the wallet ignoring it in favor of separate arguments.

## 0.2.0

### Added

-   Expose a JSON-RPC client, using the wallet's current JSON-RPC server.
-   `getMostRecentlySelectedAccount` method. This method allows dApps to get the most prioritized account without using `connect`. In a future release it will be updated to actually return the most recently selected account.

### (Breaking) Changed

-   Updated API of sendTransaction and signMessage to require the account address.
-   Updated API to include an 'accountDisconnected' event.

## 0.1.1

-   sendTransaction can now take a 5th argument, which is the schema's version. This will allow V1 contract parameters to be serialized.

## 0.1.0

-   Initialized from the old browser-wallet-api-types package.
-   Added method for detecting the injected Concordium browser wallet API.
