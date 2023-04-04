import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Buffer } from 'buffer/';
import ClosedWhileSendingError from './ClosedWhileSendingError';
import { Transport } from './Transport';
import TransportStatusError from './TransportStatusError';

interface LedgerEmulatorResponse {
    data: string;
}

const successStatusCode = '9000';

export default class EmulatorTransport implements Transport {
    closed: boolean;

    emulator: AxiosInstance;

    constructor() {
        this.closed = false;
        this.emulator = axios.create({
            baseURL: globalThis.process?.env?.LEDGER_EMULATOR_URL,
        });
    }

    async close() {
        this.closed = true;
    }

    async send(cla: number, ins: number, p1: number, p2: number, data?: Buffer) {
        this.closed = false;
        try {
            let dataAsNodeBuffer: Buffer | undefined;
            let message;
            const messagePrefix = Buffer.concat([Buffer.of(cla), Buffer.of(ins), Buffer.of(p1), Buffer.of(p2)]);
            if (data) {
                dataAsNodeBuffer = Buffer.from(data);
                message = Buffer.concat([messagePrefix, Buffer.of(dataAsNodeBuffer.length), dataAsNodeBuffer]).toString(
                    'hex'
                );
            } else {
                message = Buffer.concat([messagePrefix, Buffer.of(0)]).toString('hex');
            }

            // The emulator exposes a REST API that we call, which will forward our APDU messages to the emulated
            // Ledger device. Send the APDU message in the format expected by the REST API, and parse the message
            // for any errors returned. If an error was present, then throw it (like it would have been) in the
            // real Transport implementation.
            const emulatorResponse: AxiosResponse<LedgerEmulatorResponse> = await this.emulator.post('/apdu', {
                data: message,
            });

            // The status code is available in the last 4 characters of the data.
            const statusCode = emulatorResponse.data.data.substring(
                emulatorResponse.data.data.length - 4,
                emulatorResponse.data.data.length
            );
            if (statusCode !== successStatusCode) {
                // Throw an error in the expected format. The status code is the only important value
                // as that will be translated to a proper error message.
                throw new TransportStatusError(Number(`0x${statusCode}`));
            }

            const response = Buffer.from(emulatorResponse.data.data, 'hex');
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
