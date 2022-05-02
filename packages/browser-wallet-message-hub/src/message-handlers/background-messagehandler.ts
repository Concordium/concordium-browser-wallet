import { getCurrentTab } from '../shared/utils/extensionHelpers';
import { AbstractMessageHandler } from './abstract-messagehandler';
import { HandlerTypeEnum } from './handlertype-enum';
import { Message } from './message';
import { logger } from './logger';
import { MessageTypeEnum } from './messagetype-enum';

export class BackgroundMessageHandler extends AbstractMessageHandler {
    /**
     *
     * @private - Keeps references to all connected Ports (dApps)
     */
    public constructor() {
        super(HandlerTypeEnum.backgroundScript);
    }

    private async injectWalletIntoDapp(): Promise<void> {
        const tab: chrome.tabs.Tab = await getCurrentTab();
        logger.log('Injecting InjectScript into dApp Context Main world');
        await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
            // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
            files: ['inject.js'],
            world: 'MAIN',
        });
    }

    public publishMessage(message: Message): void {
        // Publish the message to the currently active tab having a port connected
        getCurrentTab().then((tab) => {
            logger.log(`publishMessage: ${JSON.stringify(tab.id)}`);

            if (tab && tab.id && this.tabsDictionary.get(tab.id)) {
                const port: chrome.runtime.Port = this.tabsDictionary.get(tab.id)!;

                logger.log(`port name: ${port.name}`);
                port.postMessage(message);
            } else {
                logger.log(`Could not find current tab or Port for message ${JSON.stringify(message)}`);
            }
        });
    }

    // Template method implementations

    protected canHandleMessageCore(message: Message): boolean {
        return message.messageType === MessageTypeEnum.init || message.messageType === MessageTypeEnum.sendTransaction; // TODO: Just for testing
    }

    protected async handlePortMessageCore(message: Message, port: chrome.runtime.Port): Promise<void> {
        logger.log(`::BackgroundMessageHandler received ${JSON.stringify(message)}`);

        if (message.messageType === MessageTypeEnum.init) {
            await this.injectWalletIntoDapp();
        } else {
            // Respond with message
            const responseMessage: Message = new Message(
                HandlerTypeEnum.backgroundScript,
                HandlerTypeEnum.injectedScript,
                MessageTypeEnum.sendTransaction,
                {}
            );
            responseMessage.correlationId = message.correlationId;

            this.publishMessage(responseMessage);
        }
    }

    protected async handleWindowPostMessageCore(message: Message): Promise<void> {
        // NOOP
    }
}
