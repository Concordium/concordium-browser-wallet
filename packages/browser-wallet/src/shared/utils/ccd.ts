import {
    getPowerOf10,
    formatNumberStringWithDigits,
    isValidResolutionString,
    parseSubNumber,
    toFraction,
    addThousandSeparators,
} from './numberStringHelpers';

export function getCcdSymbol(): string {
    return '\u03FE';
}

export const microCcdPerCcd = 1000000n;
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

// Checks that the input is a valid CCD string.
export const isValidCcdString = isValidResolutionString(microCcdPerCcd, false, false, false);

/**
 * expects the fractional part of the a CCD string.
 * i.e. from an amount of 10.001, the subCCD string is 001.
 */
const parseSubCcd = parseSubNumber(getPowerOf10(microCcdPerCcd));

/**
 * Convert a microCCD amount to a ccd string.
 * Should be used for user interaction.
 * N.B. Gives the absolute value of the amount.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
export const microCcdToCcd = toFraction(microCcdPerCcd);

/**
 * Given a CCD string, convert to microCCD
 */
export function ccdToMicroCcd(amount: string): bigint {
    if (!isValidCcdString(amount)) {
        throw new Error('Given string that was not a valid CCD string.');
    }
    if (amount.includes(separator)) {
        const separatorIndex = amount.indexOf(separator);
        const ccd = amount.slice(0, separatorIndex);
        const microCcd = parseSubCcd(amount.slice(separatorIndex + 1));
        return BigInt(ccd) * microCcdPerCcd + BigInt(microCcd);
    }
    return BigInt(amount) * microCcdPerCcd;
}

export const formatCcdString = formatNumberStringWithDigits(2);

/**
 * Given a microCCD amount, returns the same amount in CCD
 * in a displayable format.
 * Allows input type string, because microCCD from external sources are strings.
 * N.B. In case the input is a string, it is assumed that it represents the value in microCCD.
 */
export function displayAsCcd(microCcdAmount: bigint | string) {
    const amount: bigint = toBigInt(microCcdAmount);
    const negative = amount < 0n ? '-' : '';
    const abs = amount < 0n ? -amount : amount;
    const formatted = addThousandSeparators(formatCcdString(microCcdToCcd(abs)));
    return `${negative}${getCcdSymbol()}${formatted}`;
}
