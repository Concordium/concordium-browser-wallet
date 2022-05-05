import { getCurrentTab } from '../shared/utils/extensionHelpers';
import { AbstractMessageHandler } from './abstract-messagehandler';
import { HandlerTypeEnum } from './handlertype-enum';
import { Message } from './message';
import { logger } from './logger';

export abstract class AbstractWalletMessageHandler extends AbstractMessageHandler {
    // Keep map of Mesages and their associated Tabs
    private correlationIdToTabIdDictionary: Map<string, number> = new Map<string, number>();

    // Keeps track of known dApps that's "talking" to Concordium Wallet
    private tabsDictionary: Map<number, chrome.runtime.Port> = new Map<number, chrome.runtime.Port>();

    public constructor(me: HandlerTypeEnum) {
        super(me);
    }

    // Private
    private onPortDisconnect(port: chrome.runtime.Port): void {
        logger.log(`Port: ${port.name} disconnected`);

        // Remove any listeners associated with this port
        port.onDisconnect.removeListener(this.onPortDisconnect.bind(this));
        port.onMessage.removeListener(this.onPortMessage.bind(this));

        if (port.sender?.tab?.id) {
            this.tabsDictionary.delete(port.sender.tab.id);
        }
    }

    // Public

    public addRuntimePortListeners(): void {
        logger.log('::hookUpPortSendMessageMessageListener called');

        chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
            // Subscribe to lifecycle events for the current port
            port.onDisconnect.addListener(this.onPortDisconnect.bind(this));
            port.onMessage.addListener(this.onPortMessage.bind(this));

            if (port.sender?.tab?.id !== undefined) {
                logger.log(`Added Port and Tab to Dictionary. Port ${port.name}, TabId:${port.sender.tab.id}`);
                this.tabsDictionary.set(port.sender.tab.id, port);
            }
        });
    }

    public async publishMessage(message: Message) {
        let foundPort: chrome.runtime.Port | undefined;

        // Lookup TabId by correlationId
        let foundTabId: number | undefined = this.correlationIdToTabIdDictionary.get(message.correlationId);

        if (foundTabId !== undefined && this.tabsDictionary.get(foundTabId)) {
            // Post the message to the tab that sent the message in the first place.
            foundPort = this.tabsDictionary.get(foundTabId);

            // Remove entry from dictionary
            this.correlationIdToTabIdDictionary.delete(message.correlationId);
        } else {
            // We could not find any valid tabId for the message - send the message to the current tab
            const tab = await getCurrentTab();

            logger.log(`publishMessage: ${JSON.stringify(tab.id)}`);

            if (tab?.id !== undefined && this.tabsDictionary.get(tab.id)) {
                foundPort = this.tabsDictionary.get(tab.id);
                foundTabId = tab.id;
                if (!foundPort) {
                    throw new Error('port is not defined');
                }
            } else {
                logger.log(`Could not find current tab or Port for message ${JSON.stringify(message)}`);
            }
        }

        foundPort?.postMessage(message);
        logger.log(`Message ${JSON.stringify(message)} sent to Port:${foundPort?.name}, TabId:${foundTabId}`);
    }

    // Template method implementations

    protected async handlePortMessageCore(message: Message, port: chrome.runtime.Port): Promise<void> {
        if (port.sender?.tab?.id !== undefined) {
            this.tabsDictionary.set(port.sender.tab.id, port);
            this.correlationIdToTabIdDictionary.set(message.correlationId, port.sender.tab.id);
        }

        // Pass message down to the inheritor handler
        await this.handlePortMessageCoreInternal(message, port);
    }

    // Abstract Template methods

    // TODO: Having nested levels of template method pattern is not the most pretty design. But it works for the pre-mvp, but should be re-visited later on.
    protected abstract handlePortMessageCoreInternal(message: Message, port: chrome.runtime.Port): Promise<void>;
}
