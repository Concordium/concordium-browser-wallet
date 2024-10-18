export async function copyToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
    } catch (e) {
        // TODO: logging.
    }
}

/** Display a token amount with a number of decimals. Localized. */
export function formatTokenAmount(amount: bigint, decimals = 0, minDecimals = decimals) {
    const padded = amount.toString().padStart(decimals + 1, '0'); // Ensure the string length is minimum decimals + 1 characters. For CCD, this would mean minimum 7 characters long
    const integer = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals);
    const balanceFormatter = new Intl.NumberFormat(undefined, { minimumFractionDigits: minDecimals });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore format below supports strings, TypeScript is just not aware.
    return balanceFormatter.format(`${integer}.${fraction}`);
}
