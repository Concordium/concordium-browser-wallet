import { ExtensionsMessageHandler } from '@concordium/browser-wallet-message-hub';
import { storedAllowlist, storedSelectedAccount } from '@shared/storage/access';

export const popupMessageHandler = new ExtensionsMessageHandler(storedAllowlist, storedSelectedAccount);
