import SignClient from '@walletconnect/sign-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { SessionTypes } from '@walletconnect/types';
import { WalletConnection, WalletConnector } from './WalletConnection';
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
        return approval();
    } finally {
        // Close the QRCode modal in case it was open.
        QRCodeModal.close();
    }
}

class WalletConnectConnection implements WalletConnection {
    sessionNamespace: string;

    session: SessionTypes.Struct;

    constructor(sessionNamespace: string, session: SessionTypes.Struct) {
        this.sessionNamespace = sessionNamespace;
        this.session = session;
    }

    getConnectedAccount(): string {
        const fullAddress = this.session.namespaces[this.sessionNamespace].accounts[0];
        return fullAddress.substring(fullAddress.lastIndexOf(':') + 1);
    }

    disconnect(): void {}

    async signAndSendTransaction() {
        return '';
    }
}

class WalletConnectConnector implements WalletConnector {
    client: SignClient;

    chainId: string;

    isModalOpen = false;

    constructor(client: SignClient, chainId: string) {
        this.client = client;
        this.chainId = chainId;
    }

    async connect() {
        const session = await connect(this.client, this.chainId, (v) => {
            this.isModalOpen = v;
        });
        return new WalletConnectConnection(WALLET_CONNECT_SESSION_NAMESPACE, session);
    }
}
