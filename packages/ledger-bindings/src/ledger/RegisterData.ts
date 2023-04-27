import { Buffer } from 'buffer/';
import { AccountTransaction, AccountTransactionType, RegisterDataPayload } from '@concordium/common-sdk';
import { Transport } from './Transport';
import { serializeTransactionHeader } from '../utils/transactionSerialization';
import pathAsBuffer from './Path';
import { encodeWord16 } from '../utils/serializationHelpers';
import { chunkBuffer } from '../utils/basicHelpers';
import { INS_REGISTER_DATA } from './constants';

export async function signRegisterData(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    const header = serializeTransactionHeader(transaction);

    const payload = transaction.payload as RegisterDataPayload;

    const cdata = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(AccountTransactionType.RegisterData)),
        encodeWord16(payload.data.data.length),
    ]);

    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_REGISTER_DATA, p1, p2, cdata);

    p1 = 0x01;

    const chunks = chunkBuffer(payload.data.data, 255);
    let response;
    for (const chunk of chunks) {
        response = await transport.send(0xe0, INS_REGISTER_DATA, p1, p2, Buffer.from(chunk));
    }

    if (!response) {
        throw new Error('Unexpected missing response from Ledger');
    }

    return response.slice(0, 64);
}
