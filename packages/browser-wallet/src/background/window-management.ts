import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    InternalMessageType,
    MessageType,
    WalletError,
    WalletEvent,
    WalletMessage,
} from '@concordium/browser-wallet-message-hub';

import { Dimensions, large, small } from '@popup/constants/dimensions';
import { spawnedPopupUrl } from '@shared/constants/url';
import { noOp } from 'wallet-common-helpers';
import bgMessageHandler, { onMessage } from './message-handler';

const getTopLeft = async (): Promise<{ top: number; left: number }> => {
    const lastFocused = await chrome.windows.getLastFocused();
    // Position window in top right corner of lastFocused window.
    const top = lastFocused.top ?? 0;
    const left = (lastFocused.left ?? 0) + ((lastFocused.width ?? 0) - small.width);

    return { top, left };
};

/**
 * Spawns a new popup on screen. Returning promise resolves when it receives a ready event from the popup
 */
export const spawnPopup = async (messageType?: MessageType | InternalMessageType): Promise<chrome.windows.Window> => {
    const { top, left } = await getTopLeft();

    const window = chrome.windows.create({
        // The Web3 ID proof popup has a separate size from other windows. Convery this by adjusting the URL, so that
        // the scaling adjusts the window correctly.
        url: messageType === MessageType.Web3IdProof ? `${spawnedPopupUrl}&web3idproof` : spawnedPopupUrl,
        type: 'popup',
        ...small,
        top,
        left,
        width: large.width,
        height: large.height,
    });

    // As the react app needs a chance to bootstrap, we need to wait for the ready signal.
    await onMessage(InternalMessageType.PopupReady);

    return window;
};

/**
 * Checks if a popup id open and available.
 */
export const testPopupOpen = () =>
    bgMessageHandler.sendInternalMessage(InternalMessageType.TestPopupOpen).catch(() => false);

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
 * Try focusing an existing popup window.
 */
export const setPopupSize = async ({ width, height }: Dimensions) => {
    const { left } = await getTopLeft();
    try {
        await chrome.windows.update(popupId as number, {
            width,
            height: height + 30,
            left: left - (width - small.width), // Move window according to width difference.
        });
    } catch {
        // no popup was found. It's safe to assume the popup with id: "popupId" has been closed.
        popupId = undefined;
    }
};

export const openWindow = async (messageType?: MessageType | InternalMessageType) => {
    const isOpen = await testPopupOpen();

    if (!isOpen) {
        const { id } = await spawnPopup(messageType);
        popupId = id;
    } else {
        focusExisting();
    }
};

/**
 * Ensures the handler is executed when a popup window is on screen.
 */
const ensureAvailableWindow =
    (handler: ExtensionMessageHandler): ExtensionMessageHandler =>
    (...args) => {
        (async () => {
            await openWindow(args[0].messageType);
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
    handleResponse: HandleResponse<R> = (r) => Promise.resolve(r),
    /**
     * Function to run after responding
     */
    handleFinally: () => void = noOp,
    /**
     * Overwrite the filter used
     */
    filter: (msg: unknown) => boolean = createMessageTypeFilter(messageType)
): void => {
    // Wrap handler in helper ensuring a popup window is available and ready to handle incomming messages.
    const handler = ensureAvailableWindow((msg, sender, respond) => {
        bgMessageHandler
            .sendInternalMessage(internalMessageType, handleMessage(msg, sender))
            .then((r) => handleResponse(r, msg, sender))
            .then(respond)
            .catch((e: Error) => respond(new WalletError(msg, e.message))) // Usually if popup is closed prior to a response being sent.
            .finally(handleFinally);
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

    bgMessageHandler.handleMessage(filter, conditionalHandler);
};

/**
 * Checks all given runConditions in order, and stops when one returns !run, and returns the result of that condition.
 * if all conditions say run, return {run: true}.
 */
export function runConditionComposer<R>(...handlers: RunCondition<R>[]): RunCondition<R> {
    return async (msg, sender) => {
        for (const handler of handlers) {
            const result = await handler(msg, sender);
            if (!result.run) {
                return result;
            }
        }
        return { run: true };
    };
}
