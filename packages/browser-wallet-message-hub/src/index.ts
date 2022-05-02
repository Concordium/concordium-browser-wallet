// eslint-disable-next-line no-console
export const sendMessage = (message: string) => console.log('Message hub:', message);

export { Message } from './message-handlers/message';
export { AbstractMessageHandler } from './message-handlers/abstract-messagehandler';
export { InjectedMessageHandler } from './message-handlers/injected-messagehandler';

export { MessageTypeEnum } from './message-handlers/messagetype-enum';
export { HandlerTypeEnum } from './message-handlers/handlertype-enum';
