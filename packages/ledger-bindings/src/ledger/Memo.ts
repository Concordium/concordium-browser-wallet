import { DataBlob } from '@concordium/common-sdk';
import { Buffer } from 'buffer/';
import { chunkBuffer } from '../utils/basicHelpers';
import { Transport } from './Transport';

/**
 * Send memo to ledger for signing.
 * N.B. This does not send the length of the memo, and the CBOR encoded string.
 */
export default async function sendMemo(transport: Transport, ins: number, p1: number, p2: number, memo: DataBlob) {
    const chunks = chunkBuffer(memo.data, 255);
    for (const chunk of chunks) {
        await transport.send(0xe0, ins, p1, p2, Buffer.from(chunk));
    }
}
