/* eslint-disable no-console */
console.log('Background loaded');

let isLoaded = false;

async function getCurrentTab(): Promise<chrome.tabs.Tab> {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log(`BackgroundScript received message:${JSON.stringify(message)}`);

    if (message === 'init' && isLoaded === false) {
        isLoaded = true;

        // Get the current tab of chrome and execute script in dApp context MAIN world
        getCurrentTab().then((tab) => {
            if (!tab.id) {
                throw new Error('No ID for tab.');
            }

            console.log('Injecting InjectScript into dApp Context Main world');
            chrome.scripting
                .executeScript({
                    target: { tabId: tab.id },
                    files: ['./content/inject.js'],
                    world: 'MAIN',
                })
                .then(() => {
                    sendResponse('InjectScript injected from BackgroundScript');
                    return true;
                });
        });

        return true;
    }

    sendResponse('Response from Background');
    return true;
});

// To force ESModule. Can safely be removed when any imports are added.
export {};
