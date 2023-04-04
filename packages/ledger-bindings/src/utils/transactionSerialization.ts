import { Buffer } from 'buffer/';
import {
    AccountTransactionType,
    SimpleTransferPayload,
    SimpleTransferWithMemoPayload,
    RegisterDataPayload,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
    UpdateCredentialsPayload,
    AccountTransactionPayload,
    DelegationTargetType,
    DelegationTarget,
    BakerKeysWithProofs,
    AccountTransaction,
    getAccountTransactionHandler,
    calculateEnergyCost,
} from '@concordium/common-sdk';
import {
    encodeBool,
    encodeHexString,
    encodeInt8,
    encodeWord8,
    isDefined,
    NotOptional,
    orUndefined,
} from '@concordium/common-sdk/lib/serializationHelpers';
import {
    encodeWord32,
    encodeWord64,
    put,
    putHexString,
    putInt8,
    putBase58Check,
    serializeList,
    serializeCredentialDeploymentInformation,
    encodeWord16,
    encodeCcdAmount,
    getSerializedTextWithLength,
} from './serializationHelpers';

function serializeSimpleTransfer(payload: SimpleTransferPayload) {
    const kind = putInt8(AccountTransactionType.Transfer);
    const amount = encodeWord64(payload.amount.microCcdAmount);
    return Buffer.concat([kind, payload.toAddress.decodedAddress, amount]);
}

function serializeSimpleTransferWithMemo(payload: SimpleTransferWithMemoPayload) {
    const kind = putInt8(AccountTransactionType.TransferWithMemo);
    const address = payload.toAddress.decodedAddress;
    const memo = payload.memo.data;
    const amount = encodeWord64(payload.amount.microCcdAmount);
    return Buffer.concat([kind, address, memo, amount]);
}

function serializeUpdateCredentials(payload: UpdateCredentialsPayload) {
    const transactionType = Buffer.alloc(1);
    transactionType.writeUInt8(AccountTransactionType.UpdateCredentials, 0);

    const serializedNewCredentials = serializeList(payload.newCredentials, putInt8, ({ index, cdi }) =>
        Buffer.concat([putInt8(index), serializeCredentialDeploymentInformation(cdi)])
    );

    const serializedRemovedCredentials = serializeList(payload.removeCredentialIds, putInt8, putHexString);

    const threshold = Buffer.alloc(1);
    threshold.writeUInt8(payload.threshold, 0);

    return Buffer.concat([transactionType, serializedNewCredentials, serializedRemovedCredentials, threshold]);
}

function serializeRegisterData(payload: RegisterDataPayload) {
    return Buffer.concat([putInt8(AccountTransactionType.RegisterData), payload.data.data]);
}

/**
 * Makes a bitmap for transactions with optional payload fields, where each bit indicates whether a value is included or not.
 *
 * @param payload the payload to generate the bitmap for
 * @param fieldOrder the order the payload fields are serialized in. The order is represented in the bitmap from right to left, i.e index 0 of the order translates to first bit.
 *
 * @example
 * getPayloadBitmap<{test?: string; test2?: string}>({test2: 'yes'}, ['test', 'test2']) // returns 2 (00000010 as bits of UInt8)
 * getPayloadBitmap<{test?: string; test2?: string; test3?: number}>({test: 'yes', test3: 100}, ['test', 'test2', 'test3']) // returns 5 (00000101 as bits of UInt8)
 */
function getPayloadBitmap<T>(payload: T, fieldOrder: Array<keyof T>) {
    return fieldOrder
        .map((k) => payload[k])
        .reduceRight(
            // eslint-disable-next-line no-bitwise
            (acc, cur) => (acc << 1) | Number(cur !== undefined),
            0
        );
}

/**
 * Makes a type with keys from Object and values being functions that take values with types of respective original values, returning a Buffer or undefined.
 */
type SerializationSpec<T> = NotOptional<{
    [P in keyof T]: (v: T[P]) => Buffer | undefined;
}>;

/**
 * Given a specification describing how to serialize the fields of a payload of type T, this function produces a function
 * that serializes payloads of type T, returning a buffer of the serialized fields by order of occurance in serialization spec.
 */
const serializeFromSpec =
    <T>(spec: SerializationSpec<T>) =>
    (payload: T) => {
        const buffers = Object.keys(spec)
            .map((k) => {
                const v = payload[k as keyof T];
                const f = spec[k as keyof typeof spec] as (x: typeof v) => Buffer | undefined;
                return f(v);
            })
            .filter(isDefined);

        return Buffer.concat(buffers);
    };

function serializeDelegationTarget(target: DelegationTarget) {
    if (target.delegateType === DelegationTargetType.PassiveDelegation) {
        return encodeInt8(0);
    }
    return Buffer.concat([encodeInt8(1), encodeWord64(target.bakerId)]);
}

const configureDelegationSerializationSpec: SerializationSpec<ConfigureDelegationPayload> = {
    stake: orUndefined(encodeCcdAmount),
    restakeEarnings: orUndefined(encodeBool),
    delegationTarget: orUndefined(serializeDelegationTarget),
};

const getSerializedConfigureDelegationBitmap = (payload: ConfigureDelegationPayload): Buffer =>
    encodeWord16(
        getPayloadBitmap(
            payload,
            Object.keys(configureDelegationSerializationSpec) as Array<keyof ConfigureDelegationPayload>
        )
    );

function serializeConfigureDelegationPayload(payload: ConfigureDelegationPayload): Buffer {
    const bitmap = getSerializedConfigureDelegationBitmap(payload);
    const serializedPayload = serializeFromSpec(configureDelegationSerializationSpec)(payload);

    return Buffer.concat([bitmap, serializedPayload]);
}

const serializeVerifyKeys = serializeFromSpec<BakerKeysWithProofs>({
    electionVerifyKey: encodeHexString,
    proofElection: encodeHexString,
    signatureVerifyKey: encodeHexString,
    proofSig: encodeHexString,
    aggregationVerifyKey: encodeHexString,
    proofAggregation: encodeHexString,
});

const serializeUrl = (url: string) => {
    const data = Buffer.from(new TextEncoder().encode(url));
    const length = encodeWord16(data.length);
    return Buffer.concat([length, data]);
};

const configureBakerSerializationSpec: SerializationSpec<ConfigureBakerPayload> = {
    stake: orUndefined(encodeCcdAmount),
    restakeEarnings: orUndefined(encodeBool),
    openForDelegation: orUndefined(encodeWord8),
    keys: orUndefined(serializeVerifyKeys),
    metadataUrl: orUndefined(serializeUrl),
    transactionFeeCommission: orUndefined(encodeWord32),
    bakingRewardCommission: orUndefined(encodeWord32),
    finalizationRewardCommission: orUndefined(encodeWord32),
};

export const getSerializedConfigureBakerBitmap = (payload: ConfigureBakerPayload): Buffer =>
    encodeWord16(
        getPayloadBitmap(payload, Object.keys(configureBakerSerializationSpec) as Array<keyof ConfigureBakerPayload>)
    );

function serializeConfigureBakerPayload(payload: ConfigureBakerPayload): Buffer {
    const bitmap = getSerializedConfigureBakerBitmap(payload);
    const serializedPayload = serializeFromSpec(configureBakerSerializationSpec)(payload);

    return Buffer.concat([bitmap, serializedPayload]);
}

export const getSerializedMetadataUrlWithLength = (url: string) => getSerializedTextWithLength(url, encodeWord16);

export function serializeTransactionHeader(account: AccountTransaction, signatureCount = 1n) {
    const size = 32 + 8 + 8 + 4 + 8;
    const serialized = new Uint8Array(size);

    const handler = getAccountTransactionHandler(account.type);
    const payloadSize = handler.serialize(account.payload).length + 1;
    const energyAmount = calculateEnergyCost(
        signatureCount,
        BigInt(payloadSize),
        handler.getBaseEnergyCost(account.payload)
    );
    putBase58Check(serialized, 0, account.header.sender.address);
    put(serialized, 32, encodeWord64(account.header.nonce));
    put(serialized, 32 + 8, encodeWord64(BigInt(energyAmount)));
    put(serialized, 32 + 8 + 8, encodeWord32(payloadSize));
    put(serialized, 32 + 8 + 8 + 4, encodeWord64(account.header.expiry.expiryEpochSeconds));

    return Buffer.from(serialized);
}

export function serializeTransferPayload(kind: AccountTransactionType, payload: AccountTransactionPayload): Buffer {
    switch (kind) {
        case AccountTransactionType.Transfer:
            return serializeSimpleTransfer(payload as SimpleTransferPayload);
        case AccountTransactionType.TransferWithMemo:
            return serializeSimpleTransferWithMemo(payload as SimpleTransferWithMemoPayload);
        case AccountTransactionType.UpdateCredentials:
            return serializeUpdateCredentials(payload as UpdateCredentialsPayload);
        case AccountTransactionType.RegisterData:
            return serializeRegisterData(payload as RegisterDataPayload);
        case AccountTransactionType.ConfigureBaker:
            return serializeConfigureBakerPayload(payload as ConfigureBakerPayload);
        case AccountTransactionType.ConfigureDelegation:
            return serializeConfigureDelegationPayload(payload as ConfigureDelegationPayload);
        default:
            throw new Error('Unsupported transaction kind');
    }
}
