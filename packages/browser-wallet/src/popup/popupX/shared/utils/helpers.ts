import { useLocation } from 'react-router-dom';
import { displayUrl } from '@popup/shared/utils/string-helpers';

export async function copyToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
    } catch (e) {
        // TODO: logging.
    }
}

export function useUrlDisplay() {
    const { state } = useLocation();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = (state as any)?.payload?.url;
    if (!url) {
        return ['', ''];
    }
    return [displayUrl(url), url];
}
