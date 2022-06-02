import { WalletApi } from '.';

declare global {
    interface Window {
        concordiumReady?(): void;
        concordium: WalletApi | undefined;
    }
}
