import { Buffer } from 'buffer/index.js';
import { encode, decode } from 'cbor';
import { isValidResolutionString } from './numberStringHelpers.js';

const isInteger = isValidResolutionString(1, true, false, false);
/**
 * Given a string or number, return a buffer containing the value under cbor encoding.
 * N.B. given a string, this will attempt to convert it to a number, to decrease the encoded size.
 */
export function encodeAsCBOR(value: string): Buffer {
    // Prefer saving as numbers:
    if (isInteger(value)) {
        const asNumber = Number(value);
        if (asNumber > Number.MAX_SAFE_INTEGER || asNumber < Number.MIN_SAFE_INTEGER) {
            throw new Error('Unsafe number given to CBOR encoder');
        }
        return Buffer.from(encode(asNumber));
    }
    return Buffer.from(encode(value));
}

/**
 * Decode cbot encoding.
 * @param value is assumed to be a Hex string, containing cbor encoded bytes.
 */
export function decodeCBOR(value: string) {
    return decode(Buffer.from(value, 'hex'));
}

/**
 * @return if no value or an illegal value is given, this returns 0. Otherwise returns the encoded size.
 */
export function getEncodedSize(value?: string): number {
    if (!value) {
        return 0;
    }
    try {
        const encoded = encodeAsCBOR(value);
        return encoded.length;
    } catch {
        return 0;
    }
}
