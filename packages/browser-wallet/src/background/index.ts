/* eslint-disable no-console */
import { BackgroundMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/background-messagehandler';

console.log('Background loaded');

// Create BackgroundHandler which injects script into Dapp when asked.
const backgroundHandler: BackgroundMessageHandler = new BackgroundMessageHandler();

// Listen for all runtime port messages for the current selected tab
backgroundHandler.addRuntimePortListenersForCurrentTab();

// To force ESModule. Can safely be removed when any imports are added.
export {};
