import { Buffer } from 'buffer/';
import {
    AccountTransaction,
    ConfigureBakerPayload,
    AccountTransactionType,
    SimpleTransferWithMemoPayload,
    RegisterDataPayload,
    ConfigureDelegationPayload,
} from '@concordium/common-sdk';
import {
    isDefined,
    serializeConfigureBakerPayload,
    serializeConfigureDelegationPayload,
} from '@concordium/common-sdk/lib/serializationHelpers';
import { Transport } from './Transport';
import {
    serializeTransactionHeader,
    serializeTransferPayload,
    getSerializedConfigureBakerBitmap,
    getSerializedMetadataUrlWithLength,
} from '../utils/transactionSerialization';
import pathAsBuffer from './Path';
import { encodeWord16, putHexString, encodeCcdAmount } from '../utils/serializationHelpers';
import sendMemo from './Memo';
import { chunkBuffer } from '../utils/basicHelpers';

const INS_SIMPLE_TRANSFER = 0x02;
/**
const INS_TRANSFER_TO_ENCRYPTED = 0x11;
const INS_TRANSFER_TO_PUBLIC = 0x12;
const INS_ADD_OR_UPDATE_BAKER = 0x13;
const INS_REMOVE_BAKER = 0x14;
const INS_UPDATE_BAKER_STAKE = 0x15;
const INS_UPDATE_BAKER_RESTAKE_EARNINGS = 0x16
*/
const INS_SIMPLE_TRANSFER_WITH_MEMO = 0x32;
const INS_REGISTER_DATA = 0x35;
const INS_CONFIGURE_DELEGATION = 0x17;
const INS_CONFIGURE_BAKER = 0x18;

async function signSimpleTransfer(
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

async function signSimpleTransferWithMemo(
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

async function signRegisterData(
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

async function signConfigureBaker(
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

async function signConfigureDelegation(
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

export default async function signTransfer(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    switch (transaction.type) {
        case AccountTransactionType.Transfer:
            return signSimpleTransfer(transport, path, transaction);
        case AccountTransactionType.TransferWithMemo:
            return signSimpleTransferWithMemo(transport, path, transaction);
        case AccountTransactionType.RegisterData:
            return signRegisterData(transport, path, transaction);
        case AccountTransactionType.ConfigureBaker:
            return signConfigureBaker(transport, path, transaction);
        case AccountTransactionType.ConfigureDelegation:
            return signConfigureDelegation(transport, path, transaction);
        default:
            throw new Error(`The received transaction was not a supported transaction type`);
    }
}
