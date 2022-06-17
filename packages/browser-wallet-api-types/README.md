# browser-wallet-api-types

This package includes the types for the API to be used in web applications for communicating with the Concordium browser wallet.

This package changes the type of the window object, to include the injected API that is available on `window.concordium`.

Note that this package only contains the types and a description of the API, which is injected by the Concordium browser wallet.

The actual implementation can be found [In the Concordium browser wallet repository.](https://github.com/Concordium/concordium-browser-wallet/tree/main/packages/browser-wallet-api)

## Using the API

The API is automatically injected into web applications if the Concordium browser wallet extension is installed in the browser. To get access to the API use the following helper function (this will be implemented in the web-sdk):

```typescript
async function detectConcordiumProvider(timeout = 5000): Promise<WalletApi> {
    return new Promise((resolve, reject) => {
        if (window.concordium) {
            resolve(window.concordium);
        } else {
            const t = setTimeout(() => {
                if (window.concordium) {
                    resolve(window.concordium);
                } else {
                    reject();
                }
            }, timeout);
            window.addEventListener(
                'concordium#initialized',
                () => {
                    if (window.concordium) {
                        clearTimeout(t);
                        resolve(window.concordium);
                    }
                },
                { once: true }
            );
        }
    });
}
```

The following exemplifies how accessing the API can be done.

```typescript
detectConcordiumProvider()
    .then((provider) => {
        // The API is ready for use.
        const accountAddress = provider.connect();
    })
    .catch(() => console.log('Connection to the Concordium browser wallet timed out.'));
```

To include the injected types in the window object's type, one can include this package's `extend-window.d.ts` file when building.
This can be acheived by adding the following to your project's `tsconfig.json` file:

```json
{
    ...
    "include": [..., "path/to/node_modules/@concordium/browser-wallet-api-types/extend-window.d.ts"]
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

To send a transaction, two arguments need to be provided: A transaction type and a corresponding payload. Invoking `sendTransaction` returns a `Promise`, which resolves with the transaction hash for the submitted transaction.

The following exemplifies how to create a simple transfer of funds from one account (selected account in the wallet) to another. Please note that [@concordium/web-sdk](https://github.com/Concordium/concordium-node-sdk-js/tree/main/packages/web) is used to provide the correct formats and types for the transaction payload.

```typescript
const provider = await detectConcordiumProvider();
const txHash = await provider.sendTransaction(concordiumSDK.AccountTransactionType.SimpleTransfer, {
    amount: new concordiumSDK.GtuAmount(1n),
    toAddress: new concordiumSDK.AccountAddress('39bKAuC7sXCZQfo7DmVQTMbiUuBMQJ5bCfsS7sva1HvDnUXp13'),
});
```

In the case of a smart contract init/update, parameters for the specific function and a corresponding schema for serializing the parameters can be defined.

```typescript
const provider = await detectConcordiumProvider();
const txHash = await provider.sendTransaction(
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
const provider = await detectConcordiumProvider();
const signature = await provider.signMessage('This is a message to be signed');
```

### addChangeAccountListener

To react when the selected account in the wallet changes, a handler function can be assigned through `addChangeAccountListener`. This does **not** return the currently selected account when the handler is initially assigned. This can be obtained by invoking the `connect` method.

```typescript
const provider = await detectConcordiumProvider();
let selectedAccountAddress: string | undefined = undefined;
provider.addChangeAccountListener((address) => (selectedAccountAddress = address));
```
