/**
 * Enumeration of the different types of messages that can be sent from the walletApi to the message handlers and vice versa
 */
export enum MessageTypeEnum {
    // Methods
    Init = 'Init',
    SendTransaction = 'SendTransaction',
    SignMessage = 'SignMessage',
    GetAccounts = 'GetAccounts',

    // Events
    Event = 'EventMessage',
}
