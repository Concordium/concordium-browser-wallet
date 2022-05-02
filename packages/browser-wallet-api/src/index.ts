import { sendMessage } from '@concordium/browser-wallet-message-hub';

export const test = () => sendMessage('Hello from wallet API lib.');
export * from './wallet-api';
