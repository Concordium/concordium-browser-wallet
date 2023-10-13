/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer/';
import { CcdAmount, AccountAddress, ModuleReference, DataBlob } from '@concordium/web-sdk';
import { serializationTypes } from './constants';

function isGtuAmount(cand: any): cand is { microGtuAmount: bigint } {
    return cand && typeof cand.microGtuAmount === 'bigint';
}

function isCcdAmount(cand: any): cand is CcdAmount.Type {
    return cand && typeof cand.microCcdAmount === 'bigint';
}

function isAccountAddress(cand: any): cand is AccountAddress.Type {
    return cand && typeof cand.address === 'string' && cand.address.length === 50;
}

function isModuleReference(cand: any): cand is ModuleReference.Type {
    return cand && typeof cand.moduleRef === 'string' && cand.moduleRef.length === 64;
}

function isDataBlob(cand: any): cand is DataBlob {
    return cand && cand.data && Buffer.isBuffer(cand.data);
}

function replacer(this: any, k: string, value: any) {
    if (typeof value === serializationTypes.BigInt) {
        return { '@type': serializationTypes.BigInt, value: value.toString() };
    }
    const rawValue = this[k];
    if (rawValue instanceof Date) {
        if (Number.isNaN(rawValue.getTime())) {
            throw new Error(`Received a Date instance that was an invalid Date. Raw value was: [${rawValue}]`);
        }
        return { '@type': serializationTypes.Date, value };
    }
    if (Buffer.isBuffer(rawValue)) {
        return { '@type': serializationTypes.Buffer, value: rawValue.toString('base64') };
    }
    // Support older versions of the SDK
    if (isGtuAmount(rawValue)) {
        return { '@type': serializationTypes.CcdAmount, value: rawValue.microGtuAmount.toString() };
    }
    if (isCcdAmount(rawValue)) {
        return { '@type': serializationTypes.CcdAmount, value: rawValue.microCcdAmount.toString() };
    }
    if (isAccountAddress(rawValue)) {
        return { '@type': serializationTypes.AccountAddress, value: rawValue.address };
    }
    if (isModuleReference(rawValue)) {
        return { '@type': serializationTypes.ModuleReference, value: rawValue.moduleRef };
    }
    if (isDataBlob(rawValue)) {
        return { '@type': serializationTypes.DataBlob, value: rawValue.data.toString('hex') };
    }
    return value;
}

/**
 * Stringify that acts as an inverse for parse from browser-wallet @shared/utils/payload-helpers
 */
export function stringify(input: any) {
    return JSON.stringify(input, replacer);
}
