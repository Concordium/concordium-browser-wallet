import { Buffer } from 'buffer/';
import { AccountTransaction, AccountTransactionType, UpdateContractPayload } from '@concordium/common-sdk';
import { Transport } from './Transport';
import { serializeTransactionHeader } from '../utils/transactionSerialization';
import pathAsBuffer from './Path';
import { encodeWord16, encodeCcdAmount, encodeWord64 } from '../utils/serializationHelpers';
import { INS_UPDATE_CONTRACT } from './constants';
import { chunkBuffer } from '../utils/basicHelpers';

export async function signUpdateContract(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    const header = serializeTransactionHeader(transaction);

    const payload = transaction.payload as UpdateContractPayload;
    const receiveName = Buffer.from(payload.receiveName);

    const data = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(AccountTransactionType.Update)),
        encodeCcdAmount(payload.amount),
        encodeWord64(payload.address.index),
        encodeWord64(payload.address.subindex),
        encodeWord16(payload.receiveName.length),
        encodeWord16(payload.message.length),
    ]);

    let p1 = 0x00;
    const p2 = 0x00;

    let response = await transport.send(0xe0, INS_UPDATE_CONTRACT, p1, p2, data);

    p1 = 0x01;

    const nameChunks = chunkBuffer(receiveName, 255);
    for (const chunk of nameChunks) {
        response = await transport.send(0xe0, INS_UPDATE_CONTRACT, p1, p2, chunk);
    }

    p1 = 0x02;

    const messageChunks = chunkBuffer(payload.message, 255);
    for (const chunk of messageChunks) {
        response = await transport.send(0xe0, INS_UPDATE_CONTRACT, p1, p2, chunk);
    }
    return response.slice(0, 64);
}
