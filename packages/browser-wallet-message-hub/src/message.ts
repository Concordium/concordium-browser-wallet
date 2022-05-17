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
 * Enumeration of the different types of messages that can be sent from the wallet API to the extension
 */
export enum MessageType {
    SendTransaction = 'M_SendTransaction',
    SignMessage = 'M_SignMessage',
    GetAccounts = 'M_GetAccounts',
    Connect = 'M_Connect',
}

/**
 * Enumeration of the different types of messages that can be sent internally in the extension
 */
export enum InternalMessageType {
    Init = 'I_Init',
    PopupReady = 'I_PopupReady',
    SendTransaction = 'I_SendTransaction',
    SignMessage = 'I_SignMessage',
    Connect = 'I_Connect',
    TestPopupOpen = 'I_TestPopupOpen',
}

/**
 * Enumeration of the different types of events from the extension, that can be handled in the wallet API
 */
export enum EventType {
    ChangeAccount = 'E_ChangeAccount',
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
    constructor(public eventType: EventType, public payload?: Payload) {
        super();
    }
}

export class WalletMessage extends CorrelationMessage {
    constructor(public messageType: MessageType | InternalMessageType, public payload?: Payload) {
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
    isBaseMessage(msg) && (msg as WalletMessage)?.messageType !== undefined;

export const isResponse = (msg: unknown): msg is WalletResponse =>
    isBaseMessage(msg) && !isMessage(msg) && !isEvent(msg);
