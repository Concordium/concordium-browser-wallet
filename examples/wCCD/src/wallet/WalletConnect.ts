// eslint-disable-next-line max-classes-per-file
import SignClient from '@walletconnect/sign-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { SessionTypes } from '@walletconnect/types';
import { HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import { Events, Network, WalletConnection, WalletConnector } from './WalletConnection';
import { WALLET_CONNECT_PROJECT_ID } from '../constants';

const WALLET_CONNECT_SESSION_NAMESPACE = 'ccd';

async function connect(client: SignClient, chainId: string, setModalOpen: (val: boolean) => void) {
    try {
        const { uri, approval } = await client.connect({
            requiredNamespaces: {
                ccd: {
                    methods: ['sign_and_send_transaction'],
                    chains: [chainId],
                    events: ['chain_changed', 'accounts_changed'],
                },
            },
        });

        // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
        if (uri) {
            setModalOpen(true);
            QRCodeModal.open(uri, () => {
                setModalOpen(false);
            });
        }

        // Await session approval from the wallet.
        return await approval();
    } finally {
        // Close the QRCode modal in case it was open.
        QRCodeModal.close();
    }
}

export class WalletConnectConnection implements WalletConnection {
    readonly client: SignClient;

    readonly rpcClient: JsonRpcClient;

    readonly session: SessionTypes.Struct;

    constructor(client: SignClient, rpcClient: JsonRpcClient, sessionNamespace: string, session: SessionTypes.Struct) {
        this.client = client;
        this.rpcClient = rpcClient;
        this.session = session;
    }

    getJsonRpcClient(): JsonRpcClient {
        return this.rpcClient;
    }

    async signAndSendTransaction() {
        throw new Error('not yet implemented');
        return '';
    }

    async disconnect() {
        return this.client.disconnect({
            topic: this.session.topic,
            reason: {
                code: 1,
                message: 'user disconnecting',
            },
        });
    }
}

function resolveAccount(session: SessionTypes.Struct) {
    const fullAddress = session.namespaces[WALLET_CONNECT_SESSION_NAMESPACE].accounts[0];
    return fullAddress.substring(fullAddress.lastIndexOf(':') + 1);
}

export class WalletConnectConnector implements WalletConnector {
    readonly client: SignClient;

    readonly network: Network;

    isModalOpen = false;

    constructor(client: SignClient, network: Network) {
        this.client = client;
        this.network = network;
    }

    static async create(network: Network) {
        const client = await SignClient.init({
            projectId: WALLET_CONNECT_PROJECT_ID,
            metadata: {
                name: 'wCCD',
                description: 'Example dApp for the wCCD token.',
                url: '#',
                icons: ['https://walletconnect.com/walletconnect-logo.png'],
            },
        });
        return new WalletConnectConnector(client, network);
    }

    async connect(events: Events) {
        const session = await connect(this.client, `${WALLET_CONNECT_SESSION_NAMESPACE}:${this.network.name}`, (v) => {
            this.isModalOpen = v;
        });
        events.onAccountChanged(resolveAccount(session));

        // Register event handlers (from official docs).
        this.client.on('session_event', ({ topic, params: { chainId, event }, id }) => {
            // Handle session events, such as "chainChanged", "accountsChanged", etc.
            // eslint-disable-next-line no-console
            console.debug('Wallet Connect event: session_event', { topic, id, chainId, event });
            switch (event.name) {
                case 'chanChanged':
                    events.onChainChanged(event.data); // TODO implement correctly
                    break;
                case 'accountsChanged':
                    events.onAccountChanged(event.data); // TODO implement correctly
                    break;
                default:
                    // eslint-disable-next-line no-console
                    console.error(`Unsupported event: ${event.name}`);
            }
        });
        // this.client.on('session_update', ({ topic, params }) => {
        //     const { namespaces } = params;
        //     // Overwrite the `namespaces` of the existing session with the incoming one.
        //     const updatedSession = { ...session, namespaces };
        //     // Integrate the updated session state into your dapp state.
        //     // eslint-disable-next-line no-console
        //     console.debug('Wallet Connect event: session_update', { topic, updatedSession });
        // });
        this.client.on('session_delete', () => {
            // Session was deleted -> reset the dapp state, clean up from user session, etc.
            // eslint-disable-next-line no-console
            console.debug('Wallet Connect event: session_delete');
            events.onDisconnect();
        });

        const rpcClient = new JsonRpcClient(new HttpProvider(this.network.jsonRpcUrl));
        return new WalletConnectConnection(this.client, rpcClient, WALLET_CONNECT_SESSION_NAMESPACE, session);
    }
}
