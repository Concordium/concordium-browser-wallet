import { EventType, InternalMessageType, isEvent, isMessage, MessageType, WalletEvent, WalletMessage } from './message';

export const createMessageTypeFilter =
    (type: MessageType | InternalMessageType) =>
    (msg: unknown): msg is WalletMessage =>
        isMessage(msg) && msg.messageType === type;

export const createEventTypeFilter =
    (type: EventType) =>
    (msg: unknown): msg is WalletEvent =>
        isEvent(msg) && msg.eventType === type;
