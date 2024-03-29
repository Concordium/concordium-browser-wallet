# browser-wallet-api-helpers

This package includes the types for the API to be used in web applications for communicating with the Concordium browser wallet. The API is injected into `window.concordium` when it is ready.

The actual implementation of the wallet API can be found in the [in the Concordium browser wallet repository.](https://github.com/Concordium/concordium-browser-wallet/tree/main/packages/browser-wallet-api)

## Development

### Installing

See [installing](https://github.com/Concordium/concordium-browser-wallet/blob/main/README.md#installing) in repository root.

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

To request a connection to the wallet from the user, the `connect` method has to be invoked. The method returns a `Promise` resolving with information related to the most recently selected account, which has allowlisted the dApp, or rejecting if the request is rejected in the wallet. If the wallet is locked, then this call prompts the user to first unlock the wallet before accepting or rejecting the connection request.

```typescript
const provider = await detectConcordiumProvider();
const accountAddress = await provider.connect();
```

N.B. In the current version, if the dApp is already allowlisted, but not by the currently selected account, the returned account will not actually be the most recently selected account, but instead the oldest account that has allowlisted the dApp.

### getMostRecentlySelectedAccount

To get the most recently selected account, or to check whether the wallet is connected without using connect, the `getMostRecentlySelectedAccount` can be invoked. The method returns a `Promise` resolving with the address of the most recently selected account in the wallet, or with undefined if the wallet is locked or there are no connected accounts in the wallet.

```typescript
const provider = await detectConcordiumProvider();
const accountAddress = await provider.getMostRecentlySelectedAccount();
if (accountAddress) {
    // We are connected to the wallet
} else {
    // We are not connected to the wallet
}
```

### requestAccounts

To request a connection to the wallet from the user, the `requestAccounts` method has to be invoked. The method returns a `Promise` resolving with the list of accounts
that the user has chosen to connect with. The list may be empty. Alternatively the promise will be rejecting if the request is rejected in the wallet. If the wallet is locked,
then this call prompts the user to first unlock the wallet before accepting or rejecting the request.

```typescript
const provider = await detectConcordiumProvider();
const accountAddresses = await provider.requestAccounts();
```

### getSelectedChain

This can be invoked to get the genesis hash of the chain selected in the wallet. The method returns a `Promise`, resolving with the genesis hash (as a hex string) of the selected chain, or undefined if the wallet is locked or has not been set up by the user.

```typescript
const provider = await detectConcordiumProvider();
const genesisHash = await provider.getSelectedChain();
```

N.B. In the current version, if the currently selected account has not allowlisted the dApp, the returned account will not actually be the most recently selected account, but instead the oldest account that has allowlisted the dApp.

### sendTransaction

To send a transaction, three arguments need to be provided: The account address for the account in the wallet that should sign the transaction, a transaction type and a corresponding payload. Invoking `sendTransaction` returns a `Promise`, which resolves with the transaction hash for the submitted transaction.

If the wallet is locked, or you have not connected with the wallet (or previously been allowlisted) or if the user rejects signing the transaction, the `Promise` will reject.

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

In the case of a smart contract init/update, parameters for the specific function, a corresponding schema for serializing the parameters and the version of the schema can be defined.

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
    {
        type: SchemaType.Module,
        value: 'AQAAABEAAAB0d28tc3RlcC10cmFuc2ZlcgEUAAIAAAALAAAAaW5pdF9wYXJhbXMUAAMAAAAPAAAAYWNjb3VudF9ob2xkZXJzEQALHAAAAHRyYW5zZmVyX2FncmVlbWVudF90aHJlc2hvbGQCFAAAAHRyYW5zZmVyX3JlcXVlc3RfdHRsDggAAAByZXF1ZXN0cxIBBRQABAAAAA8AAAB0cmFuc2Zlcl9hbW91bnQKDgAAAHRhcmdldF9hY2NvdW50CwwAAAB0aW1lc19vdXRfYXQNCgAAAHN1cHBvcnRlcnMRAgsBFAADAAAADwAAAGFjY291bnRfaG9sZGVycxEACxwAAAB0cmFuc2Zlcl9hZ3JlZW1lbnRfdGhyZXNob2xkAhQAAAB0cmFuc2Zlcl9yZXF1ZXN0X3R0bA4BAAAABwAAAHJlY2VpdmUVAgAAAA8AAABSZXF1ZXN0VHJhbnNmZXIBAwAAAAUKCw8AAABTdXBwb3J0VHJhbnNmZXIBAwAAAAUKCw==',
    },
    0
);
```

Note that the schema should specify whether it is for the parameter's specific type or for the entire module. To specify the different schema type:

```
const moduleSchema = {
    type: SchemaType.Module,
    value: ... // base64 string
}
const parameterSchema = {
    type SchemaType.Parameter,
    value: ... // base64 string
}
```

### signMessage

It is possible to sign arbitrary messages using the keys for an account stored in the wallet, by invoking the `signMessage` method. The first parameter is the account to be used for signing the message. This method returns a `Promise` resolving with a signature of the message.

If the wallet is locked, or you have not connected with the wallet (or previously been allowlisted) or if the user rejects signing the meesage, the `Promise` will reject.

The message should be either a utf8 string or an object with the following fields:

-   data: A hex string representing the bytes that should be signed.
-   schema: A base64 string that represents a schema for the data field, and which can be used to deserialize the data into a JSON format. (For reference, the type of schema used here is the same that is used for smart contract types)

The following exemplifies requesting a signature of a message, where the message is a utf8 string:

```typescript
const provider = await detectConcordiumProvider();
const signature = await provider.signMessage(
    '4MyVHYbRkAU6fqQsoSDzni6mrVz1KEvhDJoMVmDmrCgPBD8b7S',
    'This is a message to be signed'
);
```

The following exemplifies requesting a signature of a message, where the message is an object:

```typescript
const provider = await detectConcordiumProvider();
const signature = await provider.signMessage('4MyVHYbRkAU6fqQsoSDzni6mrVz1KEvhDJoMVmDmrCgPBD8b7S', {
    data: '00000b0000004120676f6f64206974656d00a4fbca84010000',
    schema: 'FAAEAAAADQAAAGF1Y3Rpb25fc3RhdGUVAgAAAAoAAABOb3RTb2xkWWV0AgQAAABTb2xkAQEAAAALDgAAAGhpZ2hlc3RfYmlkZGVyFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAACwQAAABpdGVtFgIDAAAAZW5kDQ',
});
```

In this example the user will be shown:

```JSON
{
  "auction_state": {
    "NotSoldYet": []
  },
  "end": "2022-12-01T00:00:00+00:00",
  "highest_bidder": {
    "None": []
  },
  "item": "A good item"
}
```

### Add CIS-2 Tokens

It is possible to suggest CIS-2 tokens to be added to an account's display. This method returns a `Promise` resolving with a list containing the ids of the tokens that were added.

If the wallet is locked, or you have not connected with the wallet (or previously been allowlisted) or if the user rejects signing the meesage, the `Promise` will reject.

The following exemplifies requesting tokens with id AA and BB from the contract on index 1399, and subindex 0 to the account `2za2yAXbFiaB151oYqTteZfqiBzibHXizwjNbpdU8hodq9SfEk`.

```typescript
const provider = await detectConcordiumProvider();
await provider.addCIS2Tokens('2za2yAXbFiaB151oYqTteZfqiBzibHXizwjNbpdU8hodq9SfEk', ['AA', 'BB'], '1399', '0');
```

### Add Web3Id Credentials

To add a Web3IdCredential, use the `addWeb3IdCredential` endpoint.
The credential itself and the url for the metadata must be provided. In addition, the function takes a callback function that takes a DID for the credentialHolderId as input, and which should return the randomness used to create the commitments on the values/properties in the credential, and a proof (which can be a signature on the commitments and credentialHolderId) of the credential's validity. If the callback does not return a valid proof, the credential is not added to the wallet.

Note that the id fields of the credential are omitted, and added by the wallet itself, as they require the credentialHolderId.

// TODO link to help for how to create proof and randomness

```typescript
provider.addWeb3IdCredential(credential, metadataUrl, async (id) => {
    const randomness = createRandomness(attributes); // Choose some randomness for the attribute commitments.
    const proof = createCredentialProof(credential, id, randomness); // Create a proof to prove that the commitments are created by the issuer.
    return { proof, randomness };
});
```

### Request Verifiable Presentation for web3Id statements

It is possible to request a verifiable presentation for a given set of web3Id statements. The function takes 2 arguments. A challenge to ensure that the proof was not generated for a different context, and the statements to be proven. This method returns a Promise resolving with the verifiable presentation for the statements.

If the wallet is locked, or you have not connected with the wallet (or previously been allowlisted) or if the user rejects proving the statement, the Promise will reject.

The following exemplifies requesting a verifiable presentation for a statement named myIdStatement (To see how to create a statement check out our documentation) with a challenge of "12346789ABCD".

```typescript
const statement = myIdStatement;
const challenge = '12346789ABCD';
const provider = await detectConcordiumProvider();
const verifiablePresentation = await provider.requestVerifiablePresentation(challenge, statement);
```

## Events

### Account changed

An event is emitted when the selected account in the wallet is changed. An event is not emitted by the wallet when initially opening, only when the user
explicitly switches between accounts. The `connect` method should be used to obtain the currently selected account when starting an interaction with the wallet.
Note that the event will not be received if the user changes to an account in the wallet that is not connected to your dApp.

```typescript
const provider = await detectConcordiumProvider();
let selectedAccountAddress: string | undefined = undefined;
provider.on('accountChanged', (accountAddress) => (selectedAccountAddress = accountAddress);
```

### Account disconnected

An event is emitted when dApp connection is disconnected by the user in the wallet. The disconnect
event is only emitted to the relevant dApp being disconnected. To either reconnect or get another
connected account a dApp should use the `connect` method. This can be done either by having the user of the dApp manually press a connect button, or it can be done automatically based on the received disconnect event.

```typescript
const provider = await detectConcordiumProvider();
let selectedAccountAddress: string | undefined = undefined;
provider.on('accountDisconnected', (accountAddress) => {
    selectedAccountAddress = undefined;

    // To immediately connect to an account in the wallet again.
    // provider.connect().then((accountAddress) => (selectedAccountAddress = accountAddress));
});

// Connect to an account in the wallet again triggered elsewhere in the dApp.
provider.connect().then((accountAddress) => (selectedAccountAddress = accountAddress));
```

## Accessing the node through GRPC

The wallet API exposes a browser-wallet specific GRPC transport layer, which communicates with the concordium blockchain selected in the wallet. This can be used to construct a GRPC client, by installing the peer dependency `@concordium/web-sdk`.

```typescript
import { ConcordiumGRPCClient } from '@concordium/web-sdk/grpc';
const provider = await detectConcordiumProvider();
const client = new ConcordiumGRPCClient(provider.grpcTransport);

...
// The client can then be used to acccess the GRPC v2 API of the node used in the wallet.
const accountInfo = await client.getAccountInfo(accountAddress);
```
