import {
    createMessageTypeFilter,
    EventType,
    ExtensionMessageHandler,
    ExtensionsMessageHandler,
    MessageType,
    WalletEvent,
    WalletMessage,
} from '@concordium/browser-wallet-message-hub';

// eslint-disable-next-line import/no-cycle
import { ensureAvailableWindow } from './window-management';

const bgMessageHandler = new ExtensionsMessageHandler();

export default bgMessageHandler;

type Message = WalletMessage | WalletEvent;
type Sender = chrome.runtime.MessageSender;

export type HandleMessage<P> = (msg: Message, sender: Sender) => P;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandleResponse<R> = (response: any, msg: Message, sender: Sender) => Promise<R>;
export type RunCondition<R> = (msg: Message, sender: Sender) => Promise<{ run: true } | { run: false; response: R }>;

export const handlePopupRequest = <P, R>(
    messageType: MessageType,
    eventType: EventType,
    handleMessage: HandleMessage<P> = (msg) => msg.payload,
    handleResponse: HandleResponse<R> = (r) => Promise.resolve(r),
    /**
     * Will only forward handle request if condition resolves to {run: true}.
     */
    runCondition: RunCondition<R> = () => Promise.resolve({ run: true })
) => {
    const handler = ensureAvailableWindow((msg, sender, respond) => {
        bgMessageHandler.sendInternalEvent(eventType, handleMessage(msg, sender), (r) =>
            handleResponse(r, msg, sender).then(respond)
        );
        return true;
    });

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
