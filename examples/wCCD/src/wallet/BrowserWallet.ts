// eslint-disable-next-line max-classes-per-file
import { detectConcordiumProvider, WalletApi } from '@concordium/browser-wallet-api-helpers';
import { JsonRpcClient } from '@concordium/web-sdk';
import { Events, WalletConnection, WalletConnector } from './WalletConnection';

export class BrowserWalletConnection implements WalletConnection {
    readonly client: WalletApi;

    constructor(client: WalletApi) {
        this.client = client;
    }

    getJsonRpcClient(): JsonRpcClient {
        // TODO Fix type conversion hack.
        return this.client.getJsonRpcClient() as JsonRpcClient;
    }

    async signAndSendTransaction() {
        return '';
    }

    async disconnect() {
        return undefined;
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

    async connect(events: Events) {
        const account = await this.client.connect();
        if (!account) {
            throw new Error('connection failed');
        }
        events.onAccountChanged(account);

        // Pass relevant events from wallet onto the handler object.
        this.client.on('chainChanged', events.onChainChanged);
        this.client.on('accountChanged', events.onAccountChanged);
        this.client.on('accountDisconnected', () =>
            this.client.getMostRecentlySelectedAccount().then(events.onAccountChanged)
        );

        return new BrowserWalletConnection(this.client);
    }
}
