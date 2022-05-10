import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line import/no-cycle
import { HandlerType, MessageType, Payload } from './types';

export const filterMarkerGuid = '5d81f460-d1ba-4a28-b7c1-3cf466f86568';

export class Message {
    public correlationId: string;

    public readonly ccFilterMarker: string = filterMarkerGuid;

    constructor(
        public from: HandlerType,
        public to: HandlerType,
        public messageType: MessageType,
        public payload?: Payload
    ) {
        this.correlationId = uuidv4();
    }
}
