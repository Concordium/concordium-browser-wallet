/* eslint-disable no-console */
import { IWalletApi, walletApi } from '@concordium/browser-wallet-api';

// Inject WalletAPI to dApp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).concordium = walletApi as IWalletApi;

(window as any).concordiumReady();
