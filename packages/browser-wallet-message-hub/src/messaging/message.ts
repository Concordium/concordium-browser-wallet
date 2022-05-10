/* eslint-disable max-classes-per-file */
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line import/no-cycle
import { HandlerType, MessageType, Payload } from './types';

export const FILTER_MARKER_GUID = '5d81f460-d1ba-4a28-b7c1-3cf466f86568';

// export type IMessage<T extends keyof typeof MessageType = any> = {
//     type: T;
//     id: typeof FILTER_MARKER_GUID;
// };

// export type InitMessage = IMessage<MessageType.Init>;

// export type Transaction = {
//     payload: unknown;
// };

// export type SendTransactionMessage = IMessage<MessageType.SendTransaction> & {
//     transaction: Transaction;
// };

export class BaseMessage {
    public readonly ccFilterMarker: string = FILTER_MARKER_GUID;

    public correlationId = uuidv4();
}

export class Message extends BaseMessage {
    constructor(public from: HandlerType, public to: HandlerType, public type: MessageType, public payload?: Payload) {
        super();
    }
}

export class MessageResponse extends BaseMessage {
    constructor(message: Message, public payload?: Payload) {
        super();

        this.correlationId = message.correlationId;
    }
}

export const isBaseMessage = (msg: unknown): msg is BaseMessage =>
    (msg as Message)?.ccFilterMarker === FILTER_MARKER_GUID;

export const isMessage = (msg: unknown): msg is Message => isBaseMessage(msg) && (msg as Message)?.type !== undefined;

export const isResponse = (msg: unknown): msg is MessageResponse => isBaseMessage(msg) && !isMessage(msg);
