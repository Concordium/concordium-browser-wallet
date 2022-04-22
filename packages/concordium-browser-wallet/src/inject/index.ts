import { test } from '@concordium/browser-wallet-api';

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const promises: Map<string, any> = new Map();

class WalletApi {
    // eslint-disable-next-line class-methods-use-this
    public sendTransaction(): Promise<string> {
        console.log('ProviderApi.sendTransaction called');

        return new Promise<string>((res) => {
            // Add "res" handler to map - will be called later when BackgroundScript has responded through chrome.runtime.sendMessage
            promises.set('someGuid', res);
            window.postMessage({ source: 'inject' });
        });
    }
}

window.addEventListener('message', (event: MessageEvent) => {
    console.log('Inject.js received message');

    if (event.data.source === 'contentScript') {
        console.log('Message was received from ContentScript');

        // Execute stored Promise
        promises.get('someGuid')();
    } else {
        console.log(`Discarding message from thirdparty or InjectScript: ${JSON.stringify(event.data)}`);
    }
});

// Expose WalletAPI to dApp through window of dApp context
(window as any).concordium = new WalletApi();

console.log('injectedScript loaded');
test();

// Let dApp call sendTransaction on a regular basis to see Promise, Postmessage, chrome.runtime.sendMessage work in combination
setInterval(
    () =>
        (window as any).concordium.sendTransaction().then(() => {
            console.log('Promise resolved in Interval');
        }),
    5000
);

// To force ESModule. Can safely be removed when any imports are added.
export {};
