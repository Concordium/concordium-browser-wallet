import { getCurrentTab } from '../shared/utils/extensionHelpers';
import { HandlerTypeEnum } from './handlertype-enum';
import { Message } from './message';
import { logger } from './logger';
import { MessageTypeEnum } from './messagetype-enum';
import { AbstractExtensionMessageHandler } from './extension-messagehandler';

export class BackgroundMessageHandler extends AbstractExtensionMessageHandler {
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

    // Template method implementations

    protected canHandleMessageCore(message: Message): boolean {
        return message.messageType === MessageTypeEnum.init;
    }

    protected async handlePortMessageCoreInternal(message: Message, port: chrome.runtime.Port): Promise<void> {
        logger.log(`::BackgroundMessageHandler received ${JSON.stringify(message)}`);

        // Init message --> Install Injected script
        if (message.messageType === MessageTypeEnum.init) {
            await this.injectWalletIntoDapp();
        } else {
            // TODO: Just for testing purposes - should be deleted when PopupMessageHandler is implemented
            // Respond with message
            const responseMessage: Message = new Message(
                HandlerTypeEnum.backgroundScript,
                HandlerTypeEnum.injectedScript,
                MessageTypeEnum.sendTransaction,
                {}
            );
            responseMessage.correlationId = message.correlationId;

            await this.publishMessage(responseMessage);
        }
    }

    protected async handleWindowPostMessageCore(message: Message): Promise<void> {
        // NOOP
    }
}
