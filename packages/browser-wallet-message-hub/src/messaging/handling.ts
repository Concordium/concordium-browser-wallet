import { isMessage, Message } from './message';
import { MessageType } from './types';

export type EventHandler = (
    message: Message,
    sender: chrome.runtime.MessageSender,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    respond: (response: any) => void
) => void | boolean;

export const handleMessage = (type: MessageType, handler: EventHandler) => {
    const wrapper: EventHandler = (msg: unknown, ...args) => {
        if (isMessage(msg) && msg.type === type) {
            return handler(msg, ...args);
        }

        return false;
    };

    chrome.runtime.onMessage.addListener(wrapper);

    return () => chrome.runtime.onMessage.removeListener(wrapper);
};

export const handleOnce = (type: MessageType, handler: EventHandler) => {
    const unsub = handleMessage(type, (...args) => {
        const r = handler(...args);
        unsub();
        return r;
    });
};
