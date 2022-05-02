import { IWalletApi, test, walletApi } from '@concordium/browser-wallet-api';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';

// Inject WalletAPI to dApp
(window as any).concordium = walletApi as IWalletApi;

logger.log('::InjectedScripted executed');
