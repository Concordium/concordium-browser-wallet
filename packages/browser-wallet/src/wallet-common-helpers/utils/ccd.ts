import { CcdAmount } from '@concordium/web-sdk';
import {
    formatNumberStringWithDigits,
    isValidResolutionString,
    parseSubNumber,
    toFraction,
    addThousandSeparators,
} from './numberStringHelpers';

export function getCcdSymbol(): string {
    return '\u03FE';
}

const UNSIGNED_64BIT_MAX = 18446744073709551615n; // 2**64 - 1
export const microCcdPerCcd = 1000000n;
export const ccdMaxDecimal = 6;
export const ccdMaxValue = UNSIGNED_64BIT_MAX;
const separator = '.';

/**
 * Given an ambigous input, convert it into a bigint.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
function toBigInt(input: bigint | string): bigint {
    if (typeof input === 'string') {
        try {
            return BigInt(input);
        } catch (e) {
            throw new Error('Given string that was not a valid microCCD string.');
        }
    }
    return input;
}

const decimalsToResolution = (maxDecimals: number) => 10n ** BigInt(maxDecimals);

export function fractionalToInteger(amount: string, maxDecimals: number) {
    const integerPerFractional = decimalsToResolution(maxDecimals);
    if (!isValidResolutionString(integerPerFractional, false, false, false)(amount)) {
        throw new Error('Given string that was not a valid amount string.');
    }
    if (amount.includes(separator)) {
        const separatorIndex = amount.indexOf(separator);
        const beforeSep = amount.slice(0, separatorIndex);
        const afterSep = parseSubNumber(maxDecimals)(amount.slice(separatorIndex + 1));
        return BigInt(beforeSep) * integerPerFractional + BigInt(afterSep);
    }
    return BigInt(amount) * integerPerFractional;
}

export const integerToFractional = (maxDecimals: number) => toFraction(decimalsToResolution(maxDecimals));

// Checks that the input is a valid CCD string.
export const isValidCcdString = (cand: string) =>
    isValidResolutionString(microCcdPerCcd, false, false, false)(cand) &&
    fractionalToInteger(cand, ccdMaxDecimal) <= ccdMaxValue;

/**
 * Convert a microCCD amount to a ccd string.
 * Should be used for user interaction.
 * N.B. Gives the absolute value of the amount.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
export const microCcdToCcd = integerToFractional(ccdMaxDecimal);

/**
 * Given a CCD string, convert to microCCD
 */
export const ccdToMicroCcd = (amount: string) => fractionalToInteger(amount, ccdMaxDecimal);

export const formatCcdString = formatNumberStringWithDigits(2);

/**
 * Given a microCCD amount, returns the same amount in CCD
 * in a displayable format.
 * Allows input type string, because microCCD from external sources are strings.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
export function displayAsCcd(amount: bigint | string | CcdAmount.Type, ccdPrefix = true, ccdPostfix = false) {
    const microCcdAmount: bigint = CcdAmount.instanceOf(amount) ? amount.microCcdAmount : toBigInt(amount);
    const negative = microCcdAmount < 0n ? '-' : '';
    const abs = microCcdAmount < 0n ? -microCcdAmount : microCcdAmount;
    const formatted = addThousandSeparators(formatCcdString(microCcdToCcd(abs)));
    return `${negative}${ccdPrefix ? getCcdSymbol() : ''}${formatted}${ccdPostfix ? `\u00A0CCD` : ''}`;
}
