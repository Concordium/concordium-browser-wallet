import { EventType, isEvent, isMessage, MessageType, WalletEvent, WalletMessage } from './message';

export const createMessageTypeFilter =
    (type: MessageType) =>
    (msg: unknown): msg is WalletMessage =>
        isMessage(msg) && msg.type === type;

export const createEventTypeFilter =
    (type: EventType) =>
    (msg: unknown): msg is WalletEvent =>
        isEvent(msg) && msg.type === type;
