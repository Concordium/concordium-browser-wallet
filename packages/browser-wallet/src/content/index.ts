/* eslint-disable no-console */
import { MessageType } from '@concordium/browser-wallet-message-hub';

// Tell Wallet (BackgroundScript) to inject script into dApp Context
chrome.runtime.sendMessage({ type: MessageType.Init });
console.log('CONTENT');
