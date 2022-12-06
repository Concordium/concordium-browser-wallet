// eslint-disable-next-line max-classes-per-file
import { detectConcordiumProvider, WalletApi } from '@concordium/browser-wallet-api-helpers';
import {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    JsonRpcClient,
    SchemaVersion,
} from '@concordium/web-sdk';
import { ConnectionDelegate, WalletConnection, WalletConnector } from './WalletConnection';

export class BrowserWalletConnection implements WalletConnection {
    readonly client: WalletApi;

    constructor(client: WalletApi) {
        this.client = client;
    }

    getJsonRpcClient(): JsonRpcClient {
        return this.client.getJsonRpcClient();
    }

    async disconnect() {
        return undefined;
    }

    async signAndSendTransaction(
        accountAddress: string,
        type: AccountTransactionType,
        payload: AccountTransactionPayload,
        parameters?: Record<string, unknown>,
        schema?: string,
        schemaVersion?: SchemaVersion
    ): Promise<string> {
        if (
            (type === AccountTransactionType.InitContract || type === AccountTransactionType.Update) &&
            parameters !== undefined &&
            schema !== undefined
        ) {
            return this.client.sendTransaction(accountAddress, type, payload, parameters, schema, schemaVersion);
        }
        return this.client.sendTransaction(accountAddress, type, payload);
    }

    async signMessage(accountAddress: string, message: string): Promise<AccountTransactionSignature> {
        return this.client.signMessage(accountAddress, message);
    }
}

export class BrowserWalletConnector implements WalletConnector {
    client: WalletApi;

    constructor(client: WalletApi) {
        this.client = client;
    }

    static async create() {
        const client = await detectConcordiumProvider();
        return new BrowserWalletConnector(client);
    }

    async connect(delegate: ConnectionDelegate) {
        const account = await this.client.connect();
        if (!account) {
            throw new Error('connection failed');
        }
        delegate.onAccountChanged(account);

        // Pass relevant events from wallet onto the handler object.
        this.client.on('chainChanged', delegate.onChainChanged);
        this.client.on('accountChanged', delegate.onAccountChanged);
        this.client.on('accountDisconnected', () =>
            this.client.getMostRecentlySelectedAccount().then(delegate.onAccountChanged)
        );

        return new BrowserWalletConnection(this.client);
    }
}
