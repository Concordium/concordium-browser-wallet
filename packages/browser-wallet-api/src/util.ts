/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer/';
import { CcdAmount } from '@concordium/common-sdk/lib/types/ccdAmount';
import { AccountAddress } from '@concordium/common-sdk/lib/types/accountAddress';
import { ModuleReference } from '@concordium/common-sdk/lib/types/moduleReference';
import { DataBlob } from '@concordium/common-sdk/lib/types/DataBlob';
import { serializationTypes } from './constants';

function isGtuAmount(cand: any): cand is { microGtuAmount: bigint } {
    return cand && typeof cand.microGtuAmount === 'bigint';
}

function isCcdAmount(cand: any): cand is CcdAmount {
    return cand && typeof cand.microCcdAmount === 'bigint';
}

function isAccountAddress(cand: any): cand is AccountAddress {
    return cand && typeof cand.address === 'string' && cand.address.length === 50;
}

function isModuleReference(cand: any): cand is ModuleReference {
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
        return { '@type': serializationTypes.Date, value };
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
