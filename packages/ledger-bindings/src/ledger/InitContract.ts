import { Buffer } from 'buffer/';
import { AccountTransaction, AccountTransactionType, InitContractPayload } from '@concordium/common-sdk';
import { Transport } from './Transport';
import { serializeTransactionHeader } from '../utils/transactionSerialization';
import pathAsBuffer from './Path';
import { encodeWord16, encodeCcdAmount } from '../utils/serializationHelpers';
import { INS_INIT_CONTRACT } from './constants';
import { chunkBuffer } from '../utils/basicHelpers';

export async function signInitContract(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    const header = serializeTransactionHeader(transaction);

    const payload = transaction.payload as InitContractPayload;
    const initName = Buffer.from(payload.initName);

    const data = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(AccountTransactionType.InitContract)),
        encodeCcdAmount(payload.amount),
        payload.moduleRef.decodedModuleRef,
        encodeWord16(payload.initName.length),
        encodeWord16(payload.param.length),
    ]);

    let p1 = 0x00;
    const p2 = 0x00;

    let response = await transport.send(0xe0, INS_INIT_CONTRACT, p1, p2, data);

    p1 = 0x01;

    const nameChunks = chunkBuffer(initName, 255);
    for (const chunk of nameChunks) {
        response = await transport.send(0xe0, INS_INIT_CONTRACT, p1, p2, chunk);
    }

    p1 = 0x02;

    const messageChunks = chunkBuffer(payload.param, 255);
    for (const chunk of messageChunks) {
        response = await transport.send(0xe0, INS_INIT_CONTRACT, p1, p2, chunk);
    }
    return response.slice(0, 64);
}
