import { walletApi } from '@concordium/browser-wallet-api';

// Inject WalletAPI to dApp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).concordium = walletApi;

// TODO figure out best way to let DOM know that the API is ready for use. This assumes consumers declare a global function "concordiumReady"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).concordiumReady();
