import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    InternalMessageType,
    MessageType,
    WalletError,
    WalletEvent,
    WalletMessage,
} from '@concordium/browser-wallet-message-hub';

import { height, width } from '@popup/constants/dimensions';
import { spawnedPopupUrl } from '@shared/constants/url';
import bgMessageHandler, { onMessage } from './message-handler';

/**
 * Spawns a new popup on screen. Returning promise resolves when it receives a ready event from the popup
 */
export const spawnPopup = async (): Promise<chrome.windows.Window> => {
    const lastFocused = await chrome.windows.getLastFocused();
    // Position window in top right corner of lastFocused window.
    const top = lastFocused.top ?? 0;
    const left = (lastFocused.left ?? 0) + ((lastFocused.width ?? 0) - width);

    const window = chrome.windows.create({
        url: spawnedPopupUrl,
        type: 'popup',
        width,
        height,
        top,
        left,
    });

    // As the react app needs a chance to bootstrap, we need to wait for the ready signal.
    await onMessage(InternalMessageType.PopupReady);

    return window;
};

/**
 * Checks if a popup id open and available.
 */
const testPopupOpen = () => bgMessageHandler.sendInternalMessage(InternalMessageType.TestPopupOpen).catch(() => false);

let popupId: number | undefined;

/**
 * Try focusing an existing popup window.
 */
const focusExisting = async () => {
    try {
        await chrome.windows.update(popupId as number, { focused: true });
    } catch {
        // no popup was found. It's safe to assume the popup with id: "popupId" has been closed.
        popupId = undefined;
    }
};

/**
 * Ensures the handler is executed when a popup window is on screen.
 */
const ensureAvailableWindow =
    (handler: ExtensionMessageHandler): ExtensionMessageHandler =>
    (...args) => {
        (async () => {
            const isOpen = await testPopupOpen();

            if (!isOpen) {
                const { id } = await spawnPopup();
                popupId = id;
            } else {
                focusExisting();
            }

            handler(...args);
        })();

        return true;
    };

type Message = WalletMessage | WalletEvent;
type Sender = chrome.runtime.MessageSender;
type RunConditionResponse<R> = Promise<{ run: true } | { run: false; response: R }>;

export type HandleMessage<P> = (msg: Message, sender: Sender) => P;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandleResponse<R> = (response: any, msg: Message, sender: Sender) => Promise<R>;
export type RunCondition<R> = (msg: Message, sender: Sender) => RunConditionResponse<R>;

/**
 * Helper for adding a handler, which forwards received messages of type "messageType" to popup with type "internalMessageType".
 * When using this to add handlers, a popup window is guaranteed to be open prior to the event handler to be executed.
 * Optionally add a run condition and callbacks to handle messages and their corresponding response, which can be useful if event/response payloads depend on data not already contained in the message payload
 */
export const forwardToPopup = <P, R>(
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
     * Optional async callback for handling responses and mapping received response to new response.
     * Defaults to resolving with received response.
     */
    handleResponse: HandleResponse<R> = (r) => Promise.resolve(r)
): void => {
    // Wrap handler in helper ensuring a popup window is available and ready to handle incomming messages.
    const handler = ensureAvailableWindow((msg, sender, respond) => {
        bgMessageHandler
            .sendInternalMessage(internalMessageType, handleMessage(msg, sender))
            .then((r) => handleResponse(r, msg, sender))
            .then(respond)
            .catch((e: Error) => respond(new WalletError(msg, e.message))); // Usually if popup is closed prior to a response being sent.

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
