import { CcdAmount } from '@concordium/web-sdk';
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
export function formatTokenAmount(amount: bigint, decimals = 0, minDecimals = 2, maxDecimals = 0) {
    const padded = amount.toString().padStart(decimals + 1, '0'); // Ensure the string length is minimum decimals + 1 characters. For CCD, this would mean minimum 7 characters long
    if (decimals === 0) {
        return amount.toString();
    }

    const integer = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals);
    const balanceFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: minDecimals,
        maximumFractionDigits: maxDecimals || decimals,
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
