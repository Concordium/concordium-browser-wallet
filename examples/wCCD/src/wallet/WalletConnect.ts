import SignClient from '@walletconnect/sign-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { SessionTypes } from '@walletconnect/types';
import { Network, WalletConnection, WalletConnector } from './WalletConnection';
import { WALLET_CONNECT_SESSION_NAMESPACE } from './BrowserWallet';

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

class WalletConnectConnection implements WalletConnection {
    readonly client: SignClient;

    readonly sessionNamespace: string;

    readonly session: SessionTypes.Struct;

    constructor(client: SignClient, sessionNamespace: string, session: SessionTypes.Struct) {
        this.client = client;
        this.sessionNamespace = sessionNamespace;
        this.session = session;

        // Register event handlers (from official docs).
        client.on('session_event', (event) => {
            // Handle session events, such as "chainChanged", "accountsChanged", etc.
            // eslint-disable-next-line no-console
            console.debug('Wallet Connect event: session_event', { event });
        });
        client.on('session_update', ({ topic, params }) => {
            const { namespaces } = params;
            // Overwrite the `namespaces` of the existing session with the incoming one.
            const updatedSession = { ...session, namespaces };
            // Integrate the updated session state into your dapp state.
            // eslint-disable-next-line no-console
            console.debug('Wallet Connect event: session_update', { updatedSession });
        });
        client.on('session_delete', () => {
            // Session was deleted -> reset the dapp state, clean up from user session, etc.
            // eslint-disable-next-line no-console
            console.debug('Wallet Connect event: session_delete');
        });
    }

    getConnectedAccount(): string {
        const fullAddress = this.session.namespaces[this.sessionNamespace].accounts[0];
        const colonIdx = fullAddress.lastIndexOf(':');
        if (colonIdx < 0) {
            throw new Error(`invalid format of address '${fullAddress}'`);
        }
        const namespace = fullAddress.substring(0, colonIdx);
        if (namespace !== this.sessionNamespace) {
            throw new Error(
                `expected address '${fullAddress}' to have namespace '${this.sessionNamespace}' but it had '${namespace}'`
            );
        }
        const address = fullAddress.substring(colonIdx + 1);
        return address;
    }

    async signAndSendTransaction() {
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

class WalletConnectConnector implements WalletConnector {
    readonly client: SignClient;

    isModalOpen = false;

    constructor(client: SignClient) {
        this.client = client;
    }

    async connect(network: Network) {
        const chainId = `${WALLET_CONNECT_SESSION_NAMESPACE}:${network.name}`;
        const session = await connect(this.client, chainId, (v) => {
            this.isModalOpen = v;
        });
        return new WalletConnectConnection(this.client, WALLET_CONNECT_SESSION_NAMESPACE, session);
    }
}
