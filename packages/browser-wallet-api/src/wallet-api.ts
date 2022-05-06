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

    signMessage(): Promise<Message> {
        throw new Error('Method not implemented.');
    }

    getAccounts(): Promise<Message> {
        throw new Error('Method not implemented.');
    }

    public sendTransaction(): Promise<Message> {
        logger.log('WalletApi.sendTransaction called');

        const message: Message = new Message(
            HandlerTypeEnum.InjectedScript,
            HandlerTypeEnum.BackgroundScript,
            MessageTypeEnum.SendTransaction,
            {}
        );

        return new Promise((resolver, reject) => {
            this.promises.set(message.correlationId, { resolver, reject });

            // publish the message to the wallet extension
            this.injectedMessageHandler.publishMessage(message);
        });
    }

    private resolvePromiseOrFireEvent(message: Message): void {
        const promiseInfo = this.promises.get(message.correlationId);

        logger.log(`Found correlationId:  ${this.promises.has(message.correlationId).toString()}`);

        if (message.messageType !== MessageTypeEnum.Event) {
            if (!promiseInfo) {
                // return;
                throw Error('Message received without corresponding PromiseInfo');
            }

            this.promises.delete(message.correlationId);
            promiseInfo.resolver(message);
        } else {
            // Raise event
            this.emit('event', message.payload);
        }
    }
}

export const walletApi = new WalletApi(new InjectedMessageHandler());
