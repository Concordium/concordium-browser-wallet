// eslint-disable-next-line max-classes-per-file
import { detectConcordiumProvider, WalletApi } from '@concordium/browser-wallet-api-helpers';
import { JsonRpcClient } from '@concordium/web-sdk';
import { Events, Network, WalletConnection, WalletConnector } from './WalletConnection';

export const WALLET_CONNECT_SESSION_NAMESPACE = 'ccd';

export class BrowserWalletConnection implements WalletConnection {
    readonly client: WalletApi;

    readonly network: Network;

    constructor(client: WalletApi, network: Network, account: string, events: Events) {
        this.client = client;
        this.network = network;
        this.accountAddress = account;

        client.getMostRecentlySelectedAccount().then(events.onAccountChanged);

        // Listen for relevant events from the wallet.
        client.on('chainChanged', (genesisHash) => {
            // // Check if the user is connected to testnet by checking if the genesis hash matches the expected one.
            // // Emit a warning and disconnect if it's the wrong chain.
            // if (genesisHash !== this.network.genesisHash) {
            //     /* eslint-disable no-alert */
            //     window.alert(
            //         `Unexpected genesis hash ${genesisHash}. Expected ${this.network.genesisHash} (network "${this.network.name}").`
            //     );
            //     this.setConnectedAccount(undefined);
            // }
            events.onChainChanged(genesisHash);
        });

        client.on('accountChanged', (a) => events.onAccountChanged(a));
        client.on('accountDisconnected', () => client.getMostRecentlySelectedAccount().then(events.onAccountChanged));
    }

    async signAndSendTransaction() {
        return '';
    }

    async disconnect() {
        return undefined;
    }
}

export class BrowserWalletConnector implements WalletConnector {
    network: Network;

    client: WalletApi;

    constructor(network: Network, client: WalletApi) {
        this.network = network;
        this.client = client;
    }

    static async create(network: Network) {
        const client = await detectConcordiumProvider();
        return new BrowserWalletConnector(network, client);
    }

    getJsonRpcClient(): JsonRpcClient {
        // TODO Fix type conversion hack.
        return this.client.getJsonRpcClient() as unknown as JsonRpcClient;
    }

    async connect(events: Events) {
        const account = await this.client.connect();
        if (!account) {
            throw new Error('connection failed');
        }
        return new BrowserWalletConnection(this.client, this.network, account, events);
    }
}
