import { ExtensionsMessageHandler } from '@messaging';
import { storedAllowlist, storedSelectedAccount } from '@shared/storage/access';

export const popupMessageHandler = new ExtensionsMessageHandler(storedAllowlist, storedSelectedAccount);
