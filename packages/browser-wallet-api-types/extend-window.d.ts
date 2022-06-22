import { WalletApi } from '.';

declare global {
    interface Window {
        concordium: WalletApi | undefined;
    }
}
