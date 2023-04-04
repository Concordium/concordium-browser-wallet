import type HWTransport from '@ledgerhq/hw-transport';
import { Buffer } from 'buffer/';
import ClosedWhileSendingError from './ClosedWhileSendingError';

export type Transport = {
    close: () => Promise<void>;
    send: (cla: number, ins: number, p1: number, p2: number, data?: Buffer) => Promise<Buffer>;
    closed: boolean;
};

export class TransportImpl implements Transport {
    transport: HWTransport;

    closed: boolean;

    constructor(transport: HWTransport) {
        this.transport = transport;
        this.closed = false;
    }

    async close() {
        this.closed = true;
    }

    async send(cla: number, ins: number, p1: number, p2: number, data?: Buffer) {
        this.closed = false;
        try {
            let dataAsNodeBuffer: Buffer | undefined;
            if (data) {
                dataAsNodeBuffer = Buffer.from(data);
            }
            const response = await this.transport.send(
                cla,
                ins,
                p1,
                p2,
                dataAsNodeBuffer as globalThis.Buffer | undefined
            );
            if (this.closed) {
                throw new ClosedWhileSendingError();
            } else {
                return Buffer.from(response);
            }
        } catch (e) {
            if (this.closed) {
                throw new ClosedWhileSendingError();
            } else {
                throw e;
            }
        }
    }
}
