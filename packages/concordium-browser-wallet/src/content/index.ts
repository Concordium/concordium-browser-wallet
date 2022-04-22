import { sendMessage } from '@concordium/browser-wallet-message-hub';
/* eslint-disable no-console */
sendMessage('ContentScript fully loaded and executed');

// Tell Wallet (BackgroundScript) to inject script into dApp Context
chrome.runtime.sendMessage('init', (r) => {
    console.log(`Return message received in ContentScript from BackgroundScript: ${r}`);
});

// Listen for window.postMessage messages coming from the dApp
// note that we receive all kinds of postMessage events
window.addEventListener('message', (event: MessageEvent) => {
    if (window !== event.source && event.data.source && event.data.source !== 'inject') {
        console.log('postMessage received in ContentScript from thirdparty script --> Just ignore');
    } else if (event.data && event.data.source && event.data.source !== 'contentScript') {
        console.log(`ContentScript received:${JSON.stringify(event.data)}`);

        // Send message back to Wallet
        chrome.runtime.sendMessage(event.data, (responseCb) => {
            console.log('Response received from Background');
            console.log(responseCb);

            // Post message back to dApp through InjectedScript
            window.postMessage({ source: 'contentScript' });
        });
    }
});

// To force ESModule. Can safely be removed when any imports are added.
export {};
