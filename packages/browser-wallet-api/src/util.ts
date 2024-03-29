/* eslint-disable @typescript-eslint/no-explicit-any */
import { CcdAmount } from '@concordium/web-sdk/types';
import { Buffer } from 'buffer/';
import { isGtuAmount } from './compatibility';
import { serializationTypes } from './constants';

export function replacer(this: any, k: string, value: any) {
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
    if (rawValue instanceof Uint8Array) {
        return { '@type': serializationTypes.Buffer, value: Buffer.from(rawValue).toString('base64') };
    }
    // Support older versions of the SDK
    if (isGtuAmount(rawValue)) {
        return CcdAmount.toTypedJSON(CcdAmount.fromMicroCcd(rawValue.microGtuAmount));
    }
    return value;
}

/**
 * Stringify that acts as an inverse for parse from browser-wallet @shared/utils/payload-helpers
 */
export function stringify(input: any) {
    return JSON.stringify(input, replacer);
}
