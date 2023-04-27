import { Buffer } from 'buffer/';
import { AccountTransaction, ConfigureBakerPayload, AccountTransactionType } from '@concordium/common-sdk';
import { isDefined, serializeConfigureBakerPayload } from '@concordium/common-sdk/lib/serializationHelpers';
import { Transport } from './Transport';
import {
    serializeTransactionHeader,
    getSerializedConfigureBakerBitmap,
    getSerializedMetadataUrlWithLength,
} from '../utils/transactionSerialization';
import pathAsBuffer from './Path';
import { putHexString } from '../utils/serializationHelpers';
import { chunkBuffer } from '../utils/basicHelpers';
import { INS_CONFIGURE_BAKER } from './constants';

export async function signConfigureBaker(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    let p1 = 0x00;
    const p2 = 0x00;
    let response: Buffer;

    const send = (cdata: Buffer | undefined) => transport.send(0xe0, INS_CONFIGURE_BAKER, p1, p2, cdata);

    const header = serializeTransactionHeader(transaction);

    const payload = transaction.payload as ConfigureBakerPayload;

    const bitmap = getSerializedConfigureBakerBitmap(payload);

    const meta = Buffer.concat([
        pathAsBuffer(path),
        header,
        Buffer.from(Uint8Array.of(AccountTransactionType.ConfigureBaker)),
        bitmap,
    ]);

    response = await send(meta);

    const { metadataUrl, stake, restakeEarnings, openForDelegation, keys, ...commissions } = payload;

    const dataPayload: ConfigureBakerPayload = {
        stake,
        restakeEarnings,
        openForDelegation,
    };

    if (Object.values(dataPayload).some(isDefined) || keys !== undefined) {
        p1 = 0x01;
        let data = serializeConfigureBakerPayload(dataPayload);

        if (keys !== undefined) {
            data = Buffer.concat([
                data,
                putHexString(keys.electionVerifyKey),
                putHexString(keys.proofElection),
                putHexString(keys.signatureVerifyKey),
                putHexString(keys.proofSig),
            ]);
        }

        response = await send(data);
    }

    if (keys !== undefined) {
        p1 = 0x02;
        const aggKey = Buffer.concat([putHexString(keys.aggregationVerifyKey), putHexString(keys.proofAggregation)]);
        response = await send(aggKey);
    }

    if (metadataUrl !== undefined) {
        const { data: urlBuffer, length: urlLength } = getSerializedMetadataUrlWithLength(metadataUrl);

        p1 = 0x03;
        response = await send(urlLength);

        p1 = 0x04;
        const chunks = chunkBuffer(urlBuffer, 255);

        for (let i = 0; i < chunks.length; i += 1) {
            response = await send(Buffer.from(chunks[i]));
        }
    }

    if (Object.values(commissions).some(isDefined)) {
        p1 = 0x05;
        const comms = serializeConfigureBakerPayload(commissions);
        response = await send(comms);
    }

    return response.slice(0, 64);
}
