/* eslint-disable no-console */
import { BackgroundMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/background-messagehandler';
import { getCurrentTab } from '@concordium/browser-wallet-message-hub/src/shared/utils/extensionHelpers';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';

console.log('Background loaded');

// Create BackgroundHandler which injects script into Dapp when asked.
const backgroundHandler: BackgroundMessageHandler = new BackgroundMessageHandler();

// Listen for dApp connections and messages
backgroundHandler.addRuntimePortListeners();

// Only "init" message will get published
backgroundHandler.on('message', async (m) => {
    const tab: chrome.tabs.Tab = await getCurrentTab();
    logger.log('Injecting InjectScript into dApp Contextt Main world');
    await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
        // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
        files: ['inject.js'],
        world: 'MAIN',
    });
});

// To force ESModule. Can safely be removed when any imports are added.
export {};
