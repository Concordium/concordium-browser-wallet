/* eslint-disable @typescript-eslint/no-explicit-any */
import { CcdAmount } from '@concordium/common-sdk/lib/types/ccdAmount';
import { AccountAddress } from '@concordium/common-sdk/lib/types/accountAddress';
import { ModuleReference } from '@concordium/common-sdk/lib/types/moduleReference';

const types = {
    BigInt: 'bigint',
    Date: 'date',
    CcdAmount: 'ccdAmount',
    AccountAddress: 'accountAddress',
    ModuleReference: 'moduleReference',
};

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

function replacer(this: any, k: string, value: any) {
    if (typeof value === types.BigInt) {
        return { '@type': types.BigInt, value: value.toString() };
    }
    const rawValue = this[k];
    if (rawValue instanceof Date) {
        return { '@type': types.Date, value };
    }
    // Support older versions of the SDK
    if (isGtuAmount(rawValue)) {
        return { '@type': types.CcdAmount, value: rawValue.microGtuAmount.toString() };
    }
    if (isCcdAmount(rawValue)) {
        return { '@type': types.CcdAmount, value: rawValue.microCcdAmount.toString() };
    }
    if (isAccountAddress(rawValue)) {
        return { '@type': types.AccountAddress, value: rawValue.address };
    }
    if (isModuleReference(rawValue)) {
        return { '@type': types.ModuleReference, value: rawValue.moduleRef };
    }
    return value;
}

export function stringify(input: any) {
    return JSON.stringify(input, replacer);
}

export function parse(input: string | undefined) {
    if (!input) {
        return undefined;
    }
    return JSON.parse(input, (_, v) => {
        if (v) {
            switch (v['@type']) {
                case types.BigInt:
                    return BigInt(v.value);
                case types.Date:
                    return new Date(v.value);
                case types.CcdAmount:
                    return new CcdAmount(BigInt(v.value));
                case types.AccountAddress:
                    return new AccountAddress(v.value);
                case types.ModuleReference:
                    return new ModuleReference(v.value);
                default:
                    return v;
            }
        }
        return v;
    });
}
