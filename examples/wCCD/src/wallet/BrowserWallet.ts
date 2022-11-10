// eslint-disable-next-line max-classes-per-file

import { WalletApi } from '@concordium/browser-wallet-api-helpers';
import { WalletConnection, WalletConnector } from './WalletConnection';

export const WALLET_CONNECT_SESSION_NAMESPACE = 'ccd';

class BrowserWalletConnection implements WalletConnection {
    account: string;

    constructor(account: string) {
        this.account = account;
    }

    getConnectedAccount(): string {
        return this.account;
    }

    disconnect(): void {}

    async signAndSendTransaction() {
        return '';
    }
}

class BrowserWalletConnector implements WalletConnector {
    client: WalletApi;

    constructor(client: WalletApi) {
        this.client = client;
    }

    async connect() {
        const account = await this.client.connect();
        if (!account) {
            throw new Error('connection failed');
        }
        return new BrowserWalletConnection(account);
    }
}
