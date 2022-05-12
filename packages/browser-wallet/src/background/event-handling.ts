import { createEventTypeFilter, EventType, Payload } from '@concordium/browser-wallet-message-hub';

// eslint-disable-next-line import/no-cycle
import bgMessageHandler from './message-handler';

/**
 * Makes a promise that resolves when an event is fired, exposing the internal message payload
 */
export const eventFired = (eventType: EventType): Promise<Payload> =>
    new Promise((resolve) => {
        bgMessageHandler.handleOnce(createEventTypeFilter(eventType), (msg) => {
            resolve(msg.payload);

            return false;
        });
    });
