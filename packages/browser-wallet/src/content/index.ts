/* eslint-disable no-console */
import { MessageType, isMessage, MessageResponse, HandlerType, Message } from '@concordium/browser-wallet-message-hub';

// Tell Wallet (BackgroundScript) to inject script into dApp Context
chrome.runtime.sendMessage(new Message(HandlerType.ContentScript, HandlerType.BackgroundScript, MessageType.Init));
console.log('CONTENT');

window.addEventListener('message', ({ data }) => {
    if (isMessage(data)) {
        console.log('msg is Message', data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chrome.runtime.sendMessage(data, (response: any) => {
            console.log('response in content', response);
            window.postMessage(new MessageResponse(data, response));
        });
    }
});
