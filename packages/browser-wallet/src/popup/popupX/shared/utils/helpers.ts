import { decode, encode } from 'cbor2';
import { CcdAmount, Ratio, toBuffer } from '@concordium/web-sdk';
import { DataBlob } from '@concordium/web-sdk/types';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import { useLocation } from 'react-router-dom';
import { displayUrl } from '@popup/shared/utils/string-helpers';

export async function copyToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
    } catch (e) {
        // TODO: logging.
    }
}

export const removeNumberGrouping = (amount: string) => amount.replace(/,/g, '');

/** Display a token amount with a number of decimals + number groupings (thousand separators) */
export function formatTokenAmount(amount: bigint, decimals = 0, minDecimals = 2, maxDecimals = -1) {
    const padded = amount.toString().padStart(decimals + 1, '0'); // Ensure the string length is minimum decimals + 1 characters. For CCD, this would mean minimum 7 characters long
    if (decimals === 0) {
        return amount.toString();
    }

    const integer = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals);
    const balanceFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals > -1 ? maxDecimals : decimals,
        useGrouping: true,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore format below supports strings, TypeScript is just not aware.
    return balanceFormatter.format(`${integer}.${fraction}`);
}

/** An inverse of {@linkcode formatTokenAmount}, parsing formatted balances */
export function parseTokenAmount(amount: string, decimals = 0): bigint {
    // Remove grouping separators (e.g., commas)
    const sanitizedAmount = removeNumberGrouping(amount);
    const parts = sanitizedAmount.split('.');
    const integerPart = parts[0] || '0';
    const fractionPart = parts[1] ? parts[1].padEnd(decimals, '0') : ''.padEnd(decimals, '0');
    const combined = integerPart + fractionPart;
    return BigInt(combined);
}

/** {@linkcode formatTokenAmount} for CCD + 2 minimum decimals */
export const formatCcdAmount = (amount: CcdAmount.Type) =>
    formatTokenAmount(amount.microCcdAmount, CCD_METADATA.decimals);
/** {@linkcode parseTokenAmount} for CCD */
export const parseCcdAmount = (amount: string): CcdAmount.Type =>
    CcdAmount.fromMicroCcd(parseTokenAmount(amount, CCD_METADATA.decimals));

export function useUrlDisplay() {
    const { state } = useLocation();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = (state as any)?.payload?.url;
    if (!url) {
        return ['', ''];
    }
    return [displayUrl(url), url];
}

/** Convert and display an amount of CCD to EUR using an exchange rate. */
export function displayCcdAsEur(microCcdPerEur: Ratio, microCcd: bigint, decimals: number, eurPostfix?: boolean) {
    const eur = Number(microCcdPerEur.denominator * microCcd) / Number(microCcdPerEur.numerator);
    const eurFormatter = new Intl.NumberFormat(undefined, {
        style: eurPostfix ? undefined : 'currency',
        currency: 'EUR',
        maximumFractionDigits: decimals,
    });
    if (eurPostfix) {
        return `${eurFormatter.format(eur)} EUR`;
    }

    return eurFormatter.format(eur);
}

export function decodeMemo(memo: string | undefined): string {
    if (!memo) {
        return '';
    }

    try {
        return decode(memo) as string;
    } catch {
        // return as hex value
        return new DataBlob(toBuffer(memo, 'hex')).data.toString();
    }
}

export function encodeMemo(memo: string): DataBlob {
    return new DataBlob(encode(memo));
}

export function getMemoByteLength(memo: string): number {
    return encode(memo).byteLength;
}
