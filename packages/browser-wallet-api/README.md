# browser-wallet-api

This package is an implementation of an API to be used in web applications for communicating with the Concordium browser wallet.

## Using the API

The API is automatically injected into web applications if the Concordium browser wallet extension is installed in the browser. It is made accessible by `window.concordium`. A callback (`concordiumReady`), which needs to be defined globally, is called by the injected script to notify applications that the API is ready for use. The following exemplifies how this can be done.

```typescript
// Should be included as high in head tag of application HTML as possible to ensure the callback is defined before the script is injected.
window.concordiumReady = async () => {
    // The API is ready for use.
    const accountAddress = await window.concordium.connect();
};
```

## API instance methods

### connect

To request a connection to the wallet from the user, the `connect` method has to be invoked. The method returns a `Promise` resolving with information related to the currently selected account in the wallet, or rejecting if the request is rejected in the wallet. If this is not called, it will be called as part of any other request (f.x. `sendTransaction` or `signMessage`) made by the API.

```typescript
const accountAddress = await window.concordium.connect();
```

### sendTransaction

To send a transaction, two arguments need to be provided: A transaction type and a corresponding payload. Invoking `sendTransaction` returns a `Promise`, which resolves with the transaction hash for the submitted transaction.

The following exemplifies how to create a simple transfer of funds from one account (selected account in the wallet) to another. Please note that [@concordium/web-sdk](https://github.com/Concordium/concordium-node-sdk-js/tree/main/packages/web) is used to provide the correct formats and types for the transaction payload.

```typescript
const txHash = await window.concordium.sendTransaction(concordiumSDK.AccountTransactionType.SimpleTransfer, {
    amount: new concordiumSDK.GtuAmount(1n),
    toAddress: new concordiumSDK.AccountAddress('39bKAuC7sXCZQfo7DmVQTMbiUuBMQJ5bCfsS7sva1HvDnUXp13'),
});
```

In the case of a smart contract init/update, parameters for the specific function and a corresponding schema for serializing the parameters can be defined.

```typescript
const txHash = await window.concordium.sendTransaction(
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

It is possible to sign arbitrary messages using the keys for an account stored in the wallet, by invoking the `signMessage` method. This method returns a `Promise` resolving with a signature of the message.

The following exemplifies requesting a signature of a message:

```typescript
const signature = await window.concordium.signMessage('This is a message to be signed');
```

### addChangeAccountListener

To react when the selected account in the wallet changes, a handler function can be assigned through `addChangeAccountListener`. This does **not** return the currently selected account when the handler is initially assigned. This can be obtained by invoking the `connect` method.

```typescript
let selectedAccountAddress: string | undefined = undefined;
window.concordium.addChangeAccountListener((address) => (selectedAccountAddress = address));
```

## Development

### Installing

See [installing](../../README.md#installing) in repository root.

### Building

-   Run `yarn build` in the package root, which will output into the folder "lib". This is only necessary to do when preparing to publish.
