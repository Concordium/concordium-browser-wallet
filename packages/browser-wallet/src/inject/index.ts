import { IWalletApi, walletApi } from '@concordium/browser-wallet-api';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';

// Inject WalletAPI to dApp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).concordium = walletApi as IWalletApi;

logger.log('::InjectedScripted executed');

setInterval(
    () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).concordium.sendTransaction().then(() => {
            // eslint-disable-next-line no-console
            console.log('Promise resolved in Interval');
        }),
    10000
);
