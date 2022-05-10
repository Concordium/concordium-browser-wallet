import { HandlerType, isResponse, Message, MessageResponse, MessageType } from '@concordium/browser-wallet-message-hub';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';
import { Payload } from '@concordium/browser-wallet-message-hub/src/message-handlers/types';
import { PromiseInfo } from './promiseInfo';

export interface IWalletApi {
    sendTransaction(): Promise<string>;
    signMessage(): Promise<Message>;
    getAccounts(): Promise<Message>;
}

class WalletApi implements IWalletApi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly promises: Map<string, PromiseInfo<any>> = new Map<string, PromiseInfo<any>>();

    public constructor() {
        window.addEventListener('message', ({ data }) => {
            if (isResponse(data)) {
                this.resolvePromiseOrFireEvent(data);
            }
        });
        // Listens for events raised by InjectedScript
        // this.injectedMessageHandler.on('message', this.resolvePromiseOrFireEvent.bind(this));
    }

    private resolvePromiseOrFireEvent(response: MessageResponse): void {
        const promiseInfo = this.promises.get(response.correlationId);
        if (!promiseInfo) {
            throw Error('Message received without corresponding PromiseInfo');
        }

        this.promises.delete(response.correlationId);
        promiseInfo.resolver(response.payload);
    }

    private sendMessage<T>(type: MessageType, payload: Payload): Promise<T> {
        logger.log(`Sending message ${type}, Payload: ${JSON.stringify(payload)}`);

        return new Promise((resolver, reject) => {
            // publish the message to the wallet extension
            // const { correlationId } = this.injectedMessageHandler.publishMessage(
            //     HandlerType.PopupScript,
            //     type,
            //     payload
            // );
            const message = new Message(HandlerType.BackgroundScript, MessageType.SendTransaction, payload);
            window.postMessage(message);
            this.promises.set(message.correlationId, { resolver, reject });
        });
    }

    /**
     * Sends a sign request to the Concordium Wallet and awaits the users action
     */
    public signMessage(): Promise<Message> {
        return this.sendMessage(MessageType.SignMessage, {});
    }

    /**
     * Requests list of accounts from the current connected network
     */
    public getAccounts(): Promise<Message> {
        return this.sendMessage(MessageType.GetAccounts, {});
    }

    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     */
    public sendTransaction(): Promise<string> {
        return this.sendMessage<string>(MessageType.SendTransaction, {});
    }
}

export const walletApi = new WalletApi();
