import { ExtensionsMessageHandler } from '@concordium/browser-wallet-message-hub';
import { storedConnectedSites, storedSelectedAccount } from '@shared/storage/access';

export const popupMessageHandler = new ExtensionsMessageHandler(storedConnectedSites, storedSelectedAccount);
