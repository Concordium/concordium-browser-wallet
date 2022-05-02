/**
 * Enumeration of the different types of messages that can be sent from the walletApi to the message handlers and vice versa
 */
export enum MessageTypeEnum {
    // Methods
    init = 'init',
    sendTransaction = 'sendTransaction',
    signMessage = 'SignMessage',
    getAccounts = 'GetAccounts',

    // Events
    event = 'EventMessage',
}
