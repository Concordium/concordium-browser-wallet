import { ExtensionsMessageHandler } from '@concordium/browser-wallet-message-hub';
import { storedUrlWhitelist } from '@shared/storage/access';

export const popupMessageHandler = new ExtensionsMessageHandler(storedUrlWhitelist);
