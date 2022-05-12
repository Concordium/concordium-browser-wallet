import {
    createMessageTypeFilter,
    EventType,
    ExtensionsMessageHandler,
    MessageType,
    WalletEvent,
    WalletMessage,
} from '@concordium/browser-wallet-message-hub';

// eslint-disable-next-line import/no-cycle
import { ensureAvailableWindow } from './window-management';

const bgMessageHandler = new ExtensionsMessageHandler();

export default bgMessageHandler;

export const handlePopupRequest = <P>(
    messageType: MessageType,
    eventType: EventType,
    makePayload: (msg: WalletMessage | WalletEvent, sender: chrome.runtime.MessageSender) => P
) => {
    bgMessageHandler.handleMessage(
        createMessageTypeFilter(messageType),
        ensureAvailableWindow((msg, sender, respond) => {
            bgMessageHandler.sendInternalEvent(eventType, makePayload(msg, sender), respond);
            return true;
        })
    );
};
