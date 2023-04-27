import { Buffer } from 'buffer/';
import { AccountTransaction, AccountTransactionType, SimpleTransferWithMemoPayload } from '@concordium/common-sdk';
import { Transport } from './Transport';
import { serializeTransactionHeader, serializeTransferPayload } from '../utils/transactionSerialization';
import pathAsBuffer from './Path';
import { encodeWord16, encodeCcdAmount } from '../utils/serializationHelpers';
import sendMemo from './Memo';
import { INS_SIMPLE_TRANSFER, INS_SIMPLE_TRANSFER_WITH_MEMO } from './constants';

export async function signSimpleTransfer(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    const payload = serializeTransferPayload(AccountTransactionType.Transfer, transaction.payload);

    const header = serializeTransactionHeader(transaction);

    const data = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(0xe0, INS_SIMPLE_TRANSFER, p1, p2, data);
    return response.slice(0, 64);
}

export async function signSimpleTransferWithMemo(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    const header = serializeTransactionHeader(transaction);
    const payload = transaction.payload as SimpleTransferWithMemoPayload;

    const memoLength = payload.memo.data.length;

    const initialPayload = Buffer.concat([
        Buffer.from(Uint8Array.of(AccountTransactionType.TransferWithMemo)),
        payload.toAddress.decodedAddress,
        encodeWord16(memoLength),
    ]);

    const data = Buffer.concat([pathAsBuffer(path), header, initialPayload]);

    let p1 = 0x01;
    const p2 = 0x00;

    await transport.send(0xe0, INS_SIMPLE_TRANSFER_WITH_MEMO, p1, p2, data);

    p1 = 0x02;

    await sendMemo(transport, INS_SIMPLE_TRANSFER_WITH_MEMO, p1, p2, payload.memo);

    p1 = 0x03;

    const response = await transport.send(0xe0, INS_SIMPLE_TRANSFER_WITH_MEMO, p1, p2, encodeCcdAmount(payload.amount));

    return response.slice(0, 64);
}
