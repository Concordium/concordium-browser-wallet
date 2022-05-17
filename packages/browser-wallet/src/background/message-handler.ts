import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    ExtensionsMessageHandler,
    InternalMessageType,
    MessageType,
    WalletEvent,
    WalletMessage,
} from '@concordium/browser-wallet-message-hub';
import { storedUrlWhitelist } from '@shared/storage/access';

// eslint-disable-next-line import/no-cycle
import { ensureAvailableWindow } from './window-management';

const bgMessageHandler = new ExtensionsMessageHandler(storedUrlWhitelist);

export default bgMessageHandler;

type Message = WalletMessage | WalletEvent;
type Sender = chrome.runtime.MessageSender;
type RunConditionResponse<R> = Promise<{ run: true } | { run: false; response: R }>;

export type HandleMessage<P> = (msg: Message, sender: Sender) => P;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandleResponse<R> = (response: any, msg: Message, sender: Sender) => Promise<R>;
export type RunCondition<R> = (msg: Message, sender: Sender) => RunConditionResponse<R>;

/**
 * Add handler forwarding messages as events to popup.
 * When handlers are added through this helper function, a popup window is guaranteed to be open prior to the event handler to be executed.
 * Optionally add a run condition and callbacks to handle messages and their corresponding response, which can be useful if event/response payloads depend on data not already contained in the message payload
 */
export const handlePopupRequest = <P, R>(
    messageType: MessageType,
    internalMessageType: InternalMessageType,
    /**
     * Will only forward handle request if condition resolves to {run: true}.
     */
    runCondition: RunCondition<R> = () => Promise.resolve({ run: true }),
    /**
     * Optional callback for handling messages and creating the payload for the event propagated to the popup context.
     * Defaults to mapping message payload to event payload.
     */
    handleMessage: HandleMessage<P> = (msg) => msg.payload,
    /**
     * Optional async callback for handling responses.
     * Defaults to resolving with response.
     */
    handleResponse: HandleResponse<R> = (r) => Promise.resolve(r)
): void => {
    // Wrap handler in helper ensuring a popup window is available and ready to handle incomming messages.
    const handler = ensureAvailableWindow((msg, sender, respond) => {
        bgMessageHandler
            .sendInternalMessage(internalMessageType, handleMessage(msg, sender))
            .then((r) => handleResponse(r, msg, sender))
            .then(respond);

        return true;
    });

    // Check if handler should be run, or if it should be short-circuited.
    const conditionalHandler: ExtensionMessageHandler = (msg, sender, respond) => {
        runCondition(msg, sender).then((result) => {
            if (result.run) {
                handler(msg, sender, respond);
            } else {
                respond(result.response);
            }
        });

        return true;
    };

    bgMessageHandler.handleMessage(createMessageTypeFilter(messageType), conditionalHandler);
};
