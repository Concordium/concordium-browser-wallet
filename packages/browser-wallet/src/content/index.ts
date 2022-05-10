import { MessageType, isMessage, MessageResponse, HandlerType, Message } from '@concordium/browser-wallet-message-hub';

// Tell Wallet (BackgroundScript) to inject script into dApp Context
chrome.runtime.sendMessage(new Message(HandlerType.BackgroundScript, MessageType.Init));

window.addEventListener('message', ({ data }) => {
    if (isMessage(data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chrome.runtime.sendMessage(data, (response: any) => window.postMessage(new MessageResponse(data, response)));
    }
});
