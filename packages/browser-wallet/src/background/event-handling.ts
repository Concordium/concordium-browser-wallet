import { createMessageTypeFilter, InternalMessageType, Payload } from '@concordium/browser-wallet-message-hub';

// eslint-disable-next-line import/no-cycle
import bgMessageHandler from './message-handler';

/**
 * Makes a promise that resolves when an internal message is fired, exposing the internal message payload
 */
export const onMessage = (type: InternalMessageType): Promise<Payload> =>
    new Promise((resolve) => {
        bgMessageHandler.handleOnce(createMessageTypeFilter(type), (msg) => {
            resolve(msg.payload);
        });
    });
