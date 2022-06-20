import { walletApi } from '@concordium/browser-wallet-api';

// Inject WalletAPI to dApp
window.concordium = walletApi;

// Dispatches an event stating that the WalletAPI is now injected into window.
window.dispatchEvent(new Event('concordium#initialized'));
