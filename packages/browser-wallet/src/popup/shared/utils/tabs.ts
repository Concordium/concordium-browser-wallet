import { useEffect, useState } from 'react';

/**
 * Retrieves the URL of the tab that is currently open.
 * @returns the URL origin, as a string, of the tab that is currently open
 */
export async function getCurrentOpenTabUrl(): Promise<string | undefined> {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const url = tabs[0]?.url;
    if (!url) {
        return undefined;
    }
    return new URL(url).origin;
}

export function useCurrentOpenTabUrl(): string | undefined {
    const [url, setUrl] = useState<string>();

    useEffect(() => {
        getCurrentOpenTabUrl().then(setUrl);
    }, []);

    useEffect(() => {
        const listener = (_tabId: number, _changeInfo: unknown, tab: chrome.tabs.Tab) => {
            if (tab.active && tab.url) {
                setUrl(new URL(tab.url).origin);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
        return () => chrome.tabs.onUpdated.removeListener(listener);
    }, []);

    return url;
}
