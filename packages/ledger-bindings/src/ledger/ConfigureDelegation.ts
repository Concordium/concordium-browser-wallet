import { Buffer } from 'buffer/';
import { AccountTransaction, ConfigureDelegationPayload } from '@concordium/common-sdk';
import { serializeConfigureDelegationPayload } from '@concordium/common-sdk/lib/serializationHelpers';
import { Transport } from './Transport';
import { serializeTransactionHeader } from '../utils/transactionSerialization';
import pathAsBuffer from './Path';
import { INS_CONFIGURE_DELEGATION } from './constants';

export async function signConfigureDelegation(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    const payload = serializeConfigureDelegationPayload(transaction.payload as ConfigureDelegationPayload);

    const header = serializeTransactionHeader(transaction);

    const cdata = Buffer.concat([pathAsBuffer(path), header, payload]);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(0xe0, INS_CONFIGURE_DELEGATION, p1, p2, cdata);

    return response.slice(0, 64);
}
