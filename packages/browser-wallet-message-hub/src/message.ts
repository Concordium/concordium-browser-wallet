/* eslint-disable max-classes-per-file */
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enumeration of the different types of messages that can be sent from the wallet API to the extension
 */
export enum MessageType {
    SendTransaction = 'M_SendTransaction',
    SignMessage = 'M_SignMessage',
    GetAccounts = 'M_GetAccounts',
    GetSelectedAccount = 'M_GetSelectedAccount',
    GetSelectedChain = 'M_GetSelectedChain',
    Connect = 'M_Connect',
    JsonRpcRequest = 'M_JsonRpcRequest',
    GrpcRequest = 'M_GrpcRequest',
    AddTokens = 'M_AddTokens',
    IdProof = 'M_IdProof',
    ConnectAccounts = 'M_ConnectAccounts',
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
    SetViewSize = 'I_SetViewSize',
    StartIdentityIssuance = 'I_StartIdentityIssuance',
    EndIdentityIssuance = 'I_EndIdentityIssuance',
    SendCredentialDeployment = 'I_SendCredentialDeployment',
    Recovery = 'I_Recovery',
    RecoveryFinished = 'I_RecoveryFinished',
    AddTokens = 'I_AddTokens',
    IdProof = 'I_IdProof',
    CreateIdProof = 'I_CreateIdProof',
    ConnectAccounts = 'I_ConnectAccounts',
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

/**
 * Used for broadcasting from extension to browser tabs (content/inject).
 */
export class WalletEvent extends BaseMessage {
    constructor(public eventType: EventType, public payload?: Payload) {
        super();
    }
}

/**
 * Used for extension communication, both internal and from content/inject to extension.
 */
export class WalletMessage extends CorrelationMessage {
    constructor(public messageType: MessageType | InternalMessageType, public payload?: Payload) {
        super();
    }
}

/**
 * Used for responses for WalletMessages.
 */
export class WalletResponse extends CorrelationMessage {
    constructor(message: WalletMessage, public payload?: Payload) {
        super();

        this.correlationId = message.correlationId;
    }
}

/**
 * Can be used to propagate errors across extension contexts.
 */
export class WalletError extends CorrelationMessage {
    constructor(message: WalletMessage, public error: string | null = null) {
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

export const isError = (msg: unknown): msg is WalletError =>
    isBaseMessage(msg) && (msg as WalletError).error !== undefined;
