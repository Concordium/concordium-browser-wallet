# browser-wallet-api-helpers

This package includes the types for the API to be used in web applications for communicating with the Concordium browser wallet. The API is injected into `window.concordium` when it is ready.

The actual implementation of the wallet API can be found in the [in the Concordium browser wallet repository.](https://github.com/Concordium/concordium-browser-wallet/tree/main/packages/browser-wallet-api)

## Development

### Installing

See [installing](../../README.md#installing) in repository root.

### Building

-   Run `yarn build` in the package root, which will output into the folder "lib".

## Using the API

The API is automatically injected into web applications if the Concordium browser wallet extension is installed in the browser. To get access to the API a helper function is provided by this package which can be used as follows:

```typescript
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';

detectConcordiumProvider()
    .then((provider) => {
        // The API is ready for use.
        provider
            .connect()
            .then((accountAddress) => {
                // The wallet is connected to the dApp.
            })
            .catch(() => console.log('Connection to the Concordium browser wallet was rejected.'));
    })
    .catch(() => console.log('Connection to the Concordium browser wallet timed out.'));
```

### Custom method for accessing the API

If you do not wish to use the provided utility function, then it is also possible to access the API directly on `window.concordium`. If you do this, then it is your responsibility to make the necessary checks to determine if the API is ready to use. To get proper typing for this you need to update your global definitions for `Window`.

```typescript
import { WalletApi } from '@concordium/browser-wallet-api-helpers';
declare global {
    interface Window {
        concordium: WalletApi | undefined;
    }
}
```

## API instance methods

### connect

To request a connection to the wallet from the user, the `connect` method has to be invoked. The method returns a `Promise` resolving with information related to the currently selected account in the wallet, or rejecting if the request is rejected in the wallet. If this is not called, it will be called as part of any other request (f.x. `sendTransaction` or `signMessage`) made by the API.

```typescript
const provider = await detectConcordiumProvider();
const accountAddress = await provider.connect();
```

### sendTransaction

To send a transaction, three arguments need to be provided: The account address for the account in the wallet that should sign the transaction, a transaction type and a corresponding payload. Invoking `sendTransaction` returns a `Promise`, which resolves with the transaction hash for the submitted transaction.

The following exemplifies how to create a simple transfer of funds from one account to another. Please note that [@concordium/web-sdk](https://github.com/Concordium/concordium-node-sdk-js/tree/main/packages/web) is used to provide the correct formats and types for the transaction payload.

```typescript
const provider = await detectConcordiumProvider();
const txHash = await provider.sendTransaction(
    '4MyVHYbRkAU6fqQsoSDzni6mrVz1KEvhDJoMVmDmrCgPBD8b7S',
    concordiumSDK.AccountTransactionType.SimpleTransfer,
    {
        amount: new concordiumSDK.GtuAmount(1n),
        toAddress: new concordiumSDK.AccountAddress('39bKAuC7sXCZQfo7DmVQTMbiUuBMQJ5bCfsS7sva1HvDnUXp13'),
    }
);
```

In the case of a smart contract init/update, parameters for the specific function and a corresponding schema for serializing the parameters can be defined.

```typescript
const provider = await detectConcordiumProvider();
const txHash = await provider.sendTransaction(
    '4MyVHYbRkAU6fqQsoSDzni6mrVz1KEvhDJoMVmDmrCgPBD8b7S',
    concordiumSDK.AccountTransactionType.UpdateSmartContractInstance,
    {
        amount: new concordiumSDK.GtuAmount(1n),
        contractAddress: {
            index: 11n,
            subindex: 0n,
        },
        receiveName: 'two-step-transfer.receive',
        maxContractExecutionEnergy: 30000n,
    },
    {
        RequestTransfer: ['1000', '1', '3Y1RLgi5pW3x96xZ7CiDiKsTL9huU92qn6mfxpebwmtkeku8ry'],
    },
    'AQAAABEAAAB0d28tc3RlcC10cmFuc2ZlcgEUAAIAAAALAAAAaW5pdF9wYXJhbXMUAAMAAAAPAAAAYWNjb3VudF9ob2xkZXJzEQALHAAAAHRyYW5zZmVyX2FncmVlbWVudF90aHJlc2hvbGQCFAAAAHRyYW5zZmVyX3JlcXVlc3RfdHRsDggAAAByZXF1ZXN0cxIBBRQABAAAAA8AAAB0cmFuc2Zlcl9hbW91bnQKDgAAAHRhcmdldF9hY2NvdW50CwwAAAB0aW1lc19vdXRfYXQNCgAAAHN1cHBvcnRlcnMRAgsBFAADAAAADwAAAGFjY291bnRfaG9sZGVycxEACxwAAAB0cmFuc2Zlcl9hZ3JlZW1lbnRfdGhyZXNob2xkAhQAAAB0cmFuc2Zlcl9yZXF1ZXN0X3R0bA4BAAAABwAAAHJlY2VpdmUVAgAAAA8AAABSZXF1ZXN0VHJhbnNmZXIBAwAAAAUKCw8AAABTdXBwb3J0VHJhbnNmZXIBAwAAAAUKCw=='
);
```

### signMessage

It is possible to sign arbitrary messages using the keys for an account stored in the wallet, by invoking the `signMessage` method. The first parameter is the account to be used for signing the message. This method returns a `Promise` resolving with a signature of the message.

The following exemplifies requesting a signature of a message:

```typescript
const provider = await detectConcordiumProvider();
const signature = await provider.signMessage(
    '4MyVHYbRkAU6fqQsoSDzni6mrVz1KEvhDJoMVmDmrCgPBD8b7S',
    'This is a message to be signed'
);
```

### addChangeAccountListener

To react when the selected account in the wallet changes, a handler function can be assigned through `addChangeAccountListener`. This does **not** return the currently selected account when the handler is initially assigned. This can be obtained by invoking the `connect` method. Note that the event will not be received if the user changes to an account in the wallet that is not connected to your dApp.

```typescript
const provider = await detectConcordiumProvider();
let selectedAccountAddress: string | undefined = undefined;
provider.addChangeAccountListener((address) => (selectedAccountAddress = address));
```

## Accessing node through JSON-RPC

The wallet API exposes access to a JSON-RPC client. This allows a dApp to communicate with the same node as the wallet is connected to, and enables dApps to access the JSON-RPC interface without being connected to a separate server itself. The client is accessed as shown in the example below.

```typescript
const provider = await detectConcordiumProvider();
const accountInfo = await provider.getJsonRpcClient().getAccountInfo(accountAddress);
```
