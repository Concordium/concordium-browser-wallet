import { height, width } from '@popup/constants/dimensions';

/* eslint-disable no-console */
console.log('Background loaded');

let isLoaded = false;

async function getCurrentTab(): Promise<chrome.tabs.Tab> {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

const init = async () => {
    isLoaded = true;

    // Get the current tab of chrome and execute script in dApp context MAIN world
    const tab = await getCurrentTab();

    if (!tab.id) {
        throw new Error('No ID for tab.');
    }

    console.log('Injecting InjectScript into dApp Context Main world');
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
        // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
        files: ['inject.js'],
        world: 'MAIN',
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const spawnPopup = async (message: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePopupReady = (m: any) => {
        if (m === 'popupReady') {
            chrome.runtime.sendMessage(message);
            chrome.runtime.onMessage.removeListener(handlePopupReady);
        }
    };

    chrome.runtime.onMessage.addListener(handlePopupReady);

    const lastFocused = await chrome.windows.getLastFocused();
    // Position window in top right corner of lastFocused window.
    const top = lastFocused.top ?? 0;
    const left = (lastFocused.left ?? 0) + ((lastFocused.width ?? 0) - width);

    await chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width,
        height,
        top,
        left,
    });
};

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    console.log(`BackgroundScript received message:${JSON.stringify(message)}`);

    if (message === 'init' && isLoaded === false) {
        await init();

        sendResponse('InjectScript injected from BackgroundScript');
        return true;
    }
    if (message.source === 'inject' && message.type === 'triggerPopup') {
        await spawnPopup(message);

        sendResponse('Opened popup');
        return true;
    }

    sendResponse('Response from Background');
    return true;
});
