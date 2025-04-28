import { WalletApi } from './wallet-api-types';

declare global {
    interface Window {
        concordium: WalletApi | undefined;
    }
}
