/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
import {
    HandlerTypeEnum,
    InjectedMessageHandler,
    Message,
    MessageTypeEnum,
} from '@concordium/browser-wallet-message-hub';
import { EventEmitter } from 'eventemitter3';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';
import { PromiseInfo } from './promiseInfo';

export interface IWalletApi {
    sendTransaction(): Promise<Message>;
    signMessage(): Promise<Message>;
    getAccounts(): Promise<Message>;
}

class WalletApi extends EventEmitter implements IWalletApi {
    private readonly promises: Map<string, PromiseInfo<Message>> = new Map<string, PromiseInfo<Message>>();

    public constructor(private injectedMessageHandler: InjectedMessageHandler) {
        super();

        // Listens for events raised by InjectedScript
        this.injectedMessageHandler.on('message', this.resolvePromiseOrFireEvent.bind(this));
    }

    private resolvePromiseOrFireEvent(message: Message): void {
        const promiseInfo = this.promises.get(message.correlationId);
        if (message.messageType !== MessageTypeEnum.Event) {
            if (!promiseInfo) {
                throw Error('Message received without corresponding PromiseInfo');
            }

            this.promises.delete(message.correlationId);
            promiseInfo.resolver(message);
        } else {
            // Raise event
            this.emit('event', message.payload);
        }
    }

    private sendMessage(messageType: MessageTypeEnum, payload: any): Promise<Message> {
        logger.log(`Sending message ${messageType}, Payload: ${JSON.stringify(payload)}`);
        const message = new Message(HandlerTypeEnum.InjectedScript, HandlerTypeEnum.PopupScript, messageType, payload);

        return new Promise((resolver, reject) => {
            this.promises.set(message.correlationId, { resolver, reject });

            // publish the message to the wallet extension
            this.injectedMessageHandler.publishMessage(message);
        });
    }

    /**
     * Sends a sign request to the Concordium Wallet and awaits the users action
     */
    public signMessage(): Promise<Message> {
        return this.sendMessage(MessageTypeEnum.SignMessage, {});
    }

    /**
     * Requests list of accounts from the current connected network
     */
    public getAccounts(): Promise<Message> {
        return this.sendMessage(MessageTypeEnum.GetAccounts, {});
    }

    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     */
    public sendTransaction(): Promise<Message> {
        return this.sendMessage(MessageTypeEnum.SendTransaction, {});
    }
}

export const walletApi = new WalletApi(new InjectedMessageHandler());
