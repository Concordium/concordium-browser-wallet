/* eslint-disable max-classes-per-file */
import { v4 as uuidv4 } from 'uuid';

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

/**
 * Enumeration of the different types of messages that can be sent from the walletApi to the message handlers and vice versa
 */
export enum MessageType {
    SendTransaction = 'M_SendTransaction',
    SignMessage = 'M_SignMessage',
    GetAccounts = 'M_GetAccounts',
    Connect = 'M_Connect',
}

export enum EventType {
    Init = 'E_Init',
    PopupReady = 'E_PopupReady',
    ChangeAccount = 'E_ChangeAccount',
    SendTransaction = 'E_SendTransaction',
    Connect = 'E_Connect',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Payload = any;

export const FILTER_MARKER_GUID = '5d81f460-d1ba-4a28-b7c1-3cf466f86568';

export class BaseMessage {
    public readonly ccFilterMarker = FILTER_MARKER_GUID;
}

class CorrelationMessage extends BaseMessage {
    public correlationId = uuidv4();
}

export class WalletEvent extends BaseMessage {
    constructor(public type: EventType, public payload?: Payload) {
        super();
    }
}

export class WalletMessage extends CorrelationMessage {
    constructor(public type: MessageType, public payload?: Payload) {
        super();
    }
}

export class WalletResponse extends CorrelationMessage {
    constructor(message: WalletMessage, public payload?: Payload) {
        super();

        this.correlationId = message.correlationId;
    }
}

export const isBaseMessage = (msg: unknown): msg is BaseMessage =>
    (msg as WalletMessage)?.ccFilterMarker === FILTER_MARKER_GUID;

export const isEvent = (msg: unknown): msg is WalletEvent =>
    isBaseMessage(msg) && (msg as WalletMessage)?.correlationId === undefined;

export const isMessage = (msg: unknown): msg is WalletMessage =>
    isBaseMessage(msg) && (msg as WalletMessage)?.type !== undefined;

export const isResponse = (msg: unknown): msg is WalletResponse => isBaseMessage(msg) && !isMessage(msg);
