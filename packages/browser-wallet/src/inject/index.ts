import { walletApi } from '@concordium/browser-wallet-api';

// Inject WalletAPI to dApp
window.concordium = walletApi;

// TODO figure out best way to let DOM know that the API is ready for use. This assumes consumers declare a global function "concordiumReady"
window.concordiumReady?.();
