import { IWalletApi, walletApi } from '@concordium/browser-wallet-api';

// Inject WalletAPI to dApp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).concordium = walletApi as IWalletApi;

// setInterval(
//     () =>
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         (window as any).concordium.sendTransaction().then(() => {
//             // eslint-disable-next-line no-console
//             console.log('Promise resolved in Interval');
//         }),
//     10000
// );
