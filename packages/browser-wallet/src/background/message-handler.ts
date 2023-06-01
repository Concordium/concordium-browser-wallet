import {
    createMessageTypeFilter,
    ExtensionsMessageHandler,
    InternalMessageType,
    Payload,
} from '@concordium/browser-wallet-message-hub';
import { storedSelectedAccount, storedAllowlist } from '@shared/storage/access';

const bgMessageHandler = new ExtensionsMessageHandler(storedAllowlist, storedSelectedAccount);

export default bgMessageHandler;

/**
 * Makes a promise that resolves when an internal message is fired, exposing the internal message payload
 */
export const onMessage = (type: InternalMessageType): Promise<Payload> =>
    new Promise((resolve) => {
        bgMessageHandler.handleOnce(createMessageTypeFilter(type), (msg) => {
            resolve(msg.payload);
        });
    });
