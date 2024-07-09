const numberSeparator = '.';
const thousandSeparator = ',';
const pow10Format = /^1(0*)$/;
const fractionRenderSeperator = new Intl.NumberFormat().format(0.1).includes('.') ? '.' : ',';

export const isValidBigInt = (value: string | number = ''): boolean => {
    try {
        BigInt(value);
        return true;
    } catch {
        return false;
    }
};

export function getPowerOf10(resolution: bigint | number): number {
    return resolution
        .toString()
        .split('')
        .filter((c) => c === '0').length;
}

/**
 * @description
 * Tests whether or not given resolution is a power of 10.
 *
 * @param resolution power of 10 resolution (1, 10, 100, etc.)
 *
 * @example
 * isPowerOf10(10) => true
 * isPowerOf10(105) => false
 */
export function isPowOf10(resolution: bigint | number): boolean {
    return pow10Format.test(resolution.toString());
}

/**
 * @description
 * Generates a validation function for number strings.
 *
 * @param allowNegative whether or not to allow negative values in the validation.
 * @param allowFractionDigits fraction digits to allow in validation (e.g. 1 invalidates 0.01, and validates 0.3). Defaults to true if not specified, an infinte amount of fraction digits is allowed.
 * @returns function validating a value according to the params.
 *
 * @example
 * isValidNumberString(true, 3)('0.01') => true
 * isValidNumberString(true, 3)('-0.01') => true
 * isValidNumberString(true, 3)('0.0001') => false
 * isValidNumberString()('0.000000000001') => true
 */
const isValidNumberString = (
    allowNegative = false,
    allowFractionDigits: number | true = true,
    allowLeadingZeros = true,
    allowExponent = true
) => {
    let re: RegExp;
    const signedPart = allowNegative ? '(-)?' : '';
    const intPart = allowLeadingZeros ? '(\\d+)' : '(0|[1-9]\\d*)';
    const fractionPart = allowFractionDigits === true ? '(\\.\\d*)?' : `(\\.\\d{1,${allowFractionDigits}})?(0)*`;
    const exponentPart = allowExponent ? '(e[+,-]?\\d+)?' : '';

    re = new RegExp(`^${signedPart}${intPart}\\.?(0)*${exponentPart}$`);

    if (allowFractionDigits !== 0) {
        re = new RegExp(`^${signedPart}${intPart}${fractionPart}${exponentPart}$`);
    }

    return (value: string): boolean => {
        // Only allow numerals, and only allow decimals according to resolution.
        return re.test(value);
    };
};

/**
 * @description
 * Generates a function that validates values according to given resolution.
 *
 * @param resolution power of 10 resolution the value can be described as fractions of (e.g. 0.01 is valid with resolution 100, however 0.001 is not)
 * @param allowNegative whether or not to allow negative values in the validation. Defaults to false.
 * @param allowLeadingZeros whether or not to allow leading zeros ("01.0") validation. Defaults to true.
 * @returns function validating a value according to the params.
 *
 * @example
 * isValidResolutionString(100)('0.03') => true
 * isValidResolutionString(100)('0.25') => true
 * isValidResolutionString(100)('0.008') => false
 */
export const isValidResolutionString = (
    resolution: bigint | number,
    allowNegative = false,
    allowLeadingZeros = true,
    allowExponent = true
) => isValidNumberString(allowNegative, getPowerOf10(resolution), allowLeadingZeros, allowExponent);

const withValidResolution = <TReturn>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    f: (resolution: bigint | number) => TReturn
): typeof f => {
    return (resolution: bigint | number) => {
        if (!isPowOf10(resolution)) {
            throw new Error('Resolution must be a power of 10');
        }

        return f(resolution);
    };
};

/**
 * @description converts integer to number string represented as fraction.
 *
 * @throws If resolution x is anything but a power of 10 (1, 10, 100, 1000, etc.)
 *
 * @example toNumberString(100n)(10n) => '0.1'
 */
export const toFraction = withValidResolution((resolution: bigint | number) => {
    const zeros = getPowerOf10(resolution);

    return (value?: bigint | number | string): string | undefined => {
        if (value === undefined) {
            return undefined;
        }

        const numberValue = BigInt(value);
        const isNegative = numberValue < 0;
        const absolute = isNegative ? -numberValue : numberValue;
        const whole = absolute / BigInt(resolution);

        const fractions = absolute % BigInt(resolution);
        const fractionsFormatted =
            fractions === 0n
                ? ''
                : `.${'0'.repeat(zeros - fractions.toString().length)}${fractions.toString().replace(/0+$/, '')}`;
        return `${isNegative ? '-' : ''}${whole}${fractionsFormatted}`;
    };
});

export const toLocalisedFraction: typeof toFraction = (resolution) => {
    const converter = toFraction(resolution);

    return (value) => converter(value)?.replace('.', fractionRenderSeperator);
};

interface NumberParts {
    whole: string;
    fractions?: string;
    exponent?: string;
}
export const getNumberParts = (value: string): NumberParts => {
    const [mantissa, exponent] = value.toLowerCase().split('e');
    const [whole, fractions] = mantissa.split(numberSeparator);

    return {
        whole,
        fractions,
        exponent,
    };
};

/**
 * expects the fractional part of a number string.
 * i.e. from an amount of 10.001, the fraction number string is 001.
 *
 * @example
 * parseSubNumber(6)('001') => '001000'
 */
export const parseSubNumber =
    (powOf10: number) =>
    (fraction: string): string => {
        let result = fraction;

        if (fraction.length < powOf10) {
            result += '0'.repeat(Math.max(0, powOf10 - fraction.length));
        } else {
            result = fraction.substr(0, powOf10);
        }

        return result;
    };

/**
 * @description converts fraction string to bigint by multiplying with resolution. Doesn't work with order or magnitude numbers (e.g. 1.23e-3)
 *
 * @throws If resolution x is anything but a power of 10 (1, 10, 100, 1000, etc.)
 *
 * @example toResolution(100n)('0.1') => 10n
 */
export const toResolution = withValidResolution((resolution: bigint | number) => {
    const isValid = isValidResolutionString(resolution);
    const parseFraction = parseSubNumber(getPowerOf10(resolution));

    return (value?: string): bigint | undefined => {
        if (value === undefined) {
            return undefined;
        }

        if (!isValid(value)) {
            throw new Error(`Given string cannot be parsed to resolution: ${resolution}`);
        }

        if (!value.includes(numberSeparator)) {
            return BigInt(value) * BigInt(resolution);
        }

        const separatorIndex = value.indexOf(numberSeparator);
        const whole = value.slice(0, separatorIndex);
        const fractions = parseFraction(value.slice(separatorIndex + 1));
        return BigInt(whole) * BigInt(resolution) + BigInt(fractions);
    };
});

const replaceCharAt = (value: string, index: number, replacement: string): string =>
    value.substr(0, index) + replacement + value.substr(index + replacement.length);

function increment(value: string, allowOverflow = true): string {
    const negative = value.charAt(0) === '-';
    let valueInc = value;
    const lastIndex = negative ? 1 : 0;

    // Round up - increment chars from right to left while char incremented doesn't overflow.
    // eslint-disable-next-line no-plusplus
    for (let i = valueInc.length - 1; i >= lastIndex; i--) {
        const char = valueInc.charAt(i);
        const parsed = parseInt(char, 10);
        const overflows = parsed === 9;
        const replacement = !overflows || (allowOverflow && i === lastIndex) ? parsed + 1 : 0;

        valueInc = replaceCharAt(valueInc, i, replacement.toString());
        if (!overflows) {
            return valueInc;
        }
    }

    return valueInc;
}

const formatRounded = (isInt: boolean) => (whole: string, fractions: string, exponent?: string) =>
    `${whole}${isInt ? '' : `.${fractions}`}${exponent !== undefined ? `e${exponent}` : ''}`;

/**
 * @description
 * Rounds number strings to nearest value with n fraction digits.
 *
 * @param digits digits to round to. f.x. 3 gives 1.2345 => 1.235
 */
export const round =
    (digits = 0) =>
    (value: string): string => {
        const format = formatRounded(digits === 0);
        const { whole, fractions = '', exponent } = getNumberParts(value);

        if (fractions.length <= digits) {
            // If less fractions than digits to round to, do nothing.
            return value;
        }

        let roundedFractions = fractions.substr(0, digits);
        const overflow = fractions.substr(digits);

        const upperBound = BigInt(`1${new Array(overflow.length).fill('0').join('')}`);

        const nOverflow = BigInt(overflow);
        if (upperBound - nOverflow > nOverflow) {
            // Round down - simply remove overflowing digits.
            return format(whole, roundedFractions, exponent);
        }

        const wholeInc = increment(whole);
        if (digits !== 0) {
            roundedFractions = increment(roundedFractions, false);

            if (parseInt(roundedFractions, 10) !== 0 && digits) {
                return format(whole, roundedFractions, exponent);
            }
        }

        return format(wholeInc, roundedFractions, exponent);
    };

/**
 * @description
 * Works like Number.toFixed.
 *
 * @example
 * const ensureTwoDigits = toFixed(2);
 *
 * ensureTwoDigits('1.2') => '1.20'
 * ensureTwoDigits('1.223') => '1.22'
 */
export const toFixed =
    (digits: number) =>
    (value: string): string => {
        const format = formatRounded(digits === 0);
        const { whole, fractions = '', exponent } = getNumberParts(value);

        if (fractions.length <= digits) {
            const missingDigits = digits - fractions.length;
            const danglingZeros = '0'.repeat(missingDigits);

            return format(whole, `${fractions + danglingZeros}`, exponent);
        }

        return round(digits)(value);
    };

const transformValueWithExponent = (value: string): string => {
    const { whole, fractions = '', exponent = '0' } = getNumberParts(value);
    const parsedExponent = Number(exponent);

    if (parsedExponent > 0) {
        const missing = parsedExponent - fractions.length;
        const withAppendedZeros = missing > 0 ? fractions + '0'.repeat(missing) : fractions;

        const fractionsToMove = withAppendedZeros.substring(0, parsedExponent);
        const remainingFractions = withAppendedZeros.substring(parsedExponent);

        const transformedWhole = whole + fractionsToMove;

        return `${transformedWhole}${remainingFractions ? `.${remainingFractions}` : ''}`;
    }

    const absExponent = Math.abs(parsedExponent);
    const missing = absExponent - whole.length;
    const withPrependedZeros = missing > 0 ? '0'.repeat(missing) + whole : whole;

    const wholeToMove = withPrependedZeros.substring(withPrependedZeros.length - absExponent);
    const remainingWhole = withPrependedZeros.substring(0, withPrependedZeros.length - absExponent);

    const transformedFractions = wholeToMove + fractions;

    return `${remainingWhole || '0'}${transformedFractions ? `.${transformedFractions}` : ''}`;
};

const fallbackValues = ['', Infinity.toString()];

/**
 * @description
 * Formats number strings according to specified fraction digit rules.
 *
 * @param minFractionDigits min fraction digits in formatted result
 * @param maxFractionDigits max fraction digits in formatted result. Must be below min fraction digits
 *
 * @throws If given invalid value (e.g. non-number string)
 * @throws If max fraction digits < min fraction digits.
 *
 * @example
 * const formatNumber = formatNumberStringWithDigits(2, 5);
 *
 * formatNumber('1') => '1.00'
 * formatNumber('1.234') => '1.234'
 * formatNumber('1.23456789') => '1.23457'
 */
export const formatNumberStringWithDigits = (
    minFractionDigits: number,
    maxFractionDigits?: number,
    transformExponent?: boolean
) => {
    if (typeof maxFractionDigits === 'number' && maxFractionDigits < minFractionDigits) {
        throw new Error(
            `Tried to ensure more digits (${minFractionDigits}) that allowed by allowFractions (${maxFractionDigits})`
        );
    }

    const isValid = isValidNumberString(true);

    return (value = ''): string => {
        if (fallbackValues.includes(value)) {
            return value;
        }

        if (!isValid(value)) {
            throw new Error("Tried to format a string that doesn't represent a number");
        }

        const { exponent = '0' } = getNumberParts(value);

        let transformedValue = value;
        const parsedExponent = Number(exponent);

        if (transformExponent && parsedExponent !== 0) {
            transformedValue = transformValueWithExponent(value);
        }

        const { fractions = '' } = getNumberParts(transformedValue);
        const valueFractionDigits = fractions.length;

        if (valueFractionDigits === 0 && minFractionDigits === 0) {
            return transformedValue;
        }

        const digits =
            maxFractionDigits === undefined
                ? Math.max(valueFractionDigits, minFractionDigits)
                : Math.max(minFractionDigits, Math.min(maxFractionDigits, valueFractionDigits));

        return toFixed(digits)(transformedValue);
    };
};

/**
 * Ensures input function can handle negative numbers, by passing absolute values, and adding sign after execution.
 */
const handleNegativeNumbers =
    (f: (v?: string) => string) =>
    (value = '') => {
        const negative = value.startsWith('-');
        const abs = value.replace('-', '');
        return negative ? `-${f(abs)}` : f(value);
    };

/**
 * Trims leading zeros from number string. Returns input value if valid number string cannot be parsed.
 */
export const trimLeadingZeros = handleNegativeNumbers((value = ''): string => {
    return value.replace(/^0+(?=\d)/, '');
});

/**
 * Adds thousand separators to number string. Returns input value if given invalid number string.
 */
export const addThousandSeparators = handleNegativeNumbers((value = ''): string => {
    if (!isValidNumberString(true)(value)) {
        return value;
    }

    const trimmed = trimLeadingZeros(value);
    const { whole, fractions = '', exponent } = getNumberParts(trimmed);

    const amountOfSeparators = Math.floor((whole.length || 1) / 3);
    const firstSeparatorIndex = Number(BigInt(whole.length) % 3n);
    const separatorIndexes = [
        firstSeparatorIndex,
        ...Array(amountOfSeparators)
            .fill(0)
            .map((_, i) => firstSeparatorIndex + (i + 1) * 3),
    ].slice(0, amountOfSeparators);

    const withThousandSeparator = [
        whole.substr(0, firstSeparatorIndex),
        ...separatorIndexes.map((si) => whole.substr(si, 3)),
    ]
        .filter((part) => part !== '')
        .join(thousandSeparator);

    return formatRounded(!fractions)(withThousandSeparator, fractions, exponent);
});
