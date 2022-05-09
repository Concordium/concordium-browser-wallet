// eslint-disable-next-line import/no-cycle
import { Message } from './message';

/**
 * Enumeration of the different types of messages that can be sent from the walletApi to the message handlers and vice versa
 */
export enum MessageTypeEnum {
    // Methods
    Init = 'Init',
    SendTransaction = 'SendTransaction',
    SignMessage = 'SignMessage',
    GetAccounts = 'GetAccounts',
    PopupReady = 'PopupReady',

    // Events
    Event = 'EventMessage',
}

/**
 * Enumeration of the different types of scripts which are either sending or receiving messages
 */
export enum HandlerTypeEnum {
    InjectedScript = 'InjectedScript',
    ContentScript = 'ContentScript',
    PopupScript = 'PopupScript',
    BackgroundScript = 'BackgroundScript',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Payload = any;

export type EventHandler = (
    message: Message,
    respond: (payload: Payload) => void,
    metadata?: chrome.runtime.MessageSender
) => void;
