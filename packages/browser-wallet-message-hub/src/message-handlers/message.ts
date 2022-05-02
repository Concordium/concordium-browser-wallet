import { v4 as uuidv4 } from 'uuid';
import { MessageTypeEnum } from './messagetype-enum';
import { HandlerTypeEnum } from './handlertype-enum';

export const filterMarkerGuid = '5d81f460-d1ba-4a28-b7c1-3cf466f86568';

export class Message {
    public correlationId: string;

    public readonly ccFilterMarker: string = filterMarkerGuid;

    constructor(
        public from: HandlerTypeEnum,
        public to: HandlerTypeEnum,
        public messageType: MessageTypeEnum,
        public payload: any
    ) {
        this.correlationId = uuidv4();
    }
}
