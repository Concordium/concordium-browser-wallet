// eslint-disable-next-line max-classes-per-file

import { WalletApi } from '@concordium/browser-wallet-api-helpers';
import { Network, WalletConnection, WalletConnector } from './WalletConnection';
import { JsonRpcClient } from '@concordium/web-sdk';

export const WALLET_CONNECT_SESSION_NAMESPACE = 'ccd';

export class BrowserWalletConnection implements WalletConnection {
    readonly client: WalletApi;

    readonly network: Network;

    accountAddress: string | undefined;

    constructor(client: WalletApi, network: Network, account: string) {
        this.client = client;
        this.network = network;
        this.accountAddress = account;

        client.getMostRecentlySelectedAccount().then(this.setConnectedAccount);

        // Listen for relevant events from the wallet.
        client.on('chainChanged', (genesisHash) => {
            // Check if the user is connected to testnet by checking if the genesis hash matches the expected one.
            // Emit a warning and disconnect if it's the wrong chain.
            if (genesisHash !== this.network.genesisHash) {
                /* eslint-disable no-alert */
                window.alert('Check if your Concordium browser wallet is connected to testnet!');
                this.setConnectedAccount(undefined);
            }
        });

        client.on('accountChanged', (a) => {
            this.accountAddress = a;
        });
        client.on('accountDisconnected', () => client.getMostRecentlySelectedAccount().then(this.setConnectedAccount));
    }

    getJsonRpcClient(): JsonRpcClient {
        return this.client.getJsonRpcClient();
    }

    getConnectedAccount(): string | undefined {
        return this.accountAddress;
    }

    setConnectedAccount(a: string | undefined): void {
        this.accountAddress = a;
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

    async connect(network: Network) {
        const account = await this.client.connect();
        if (!account) {
            throw new Error('connection failed');
        }
        return new BrowserWalletConnection(this.client, network, account);
    }
}
