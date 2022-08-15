/**
 * Retrieves the URL of the tab that is currently open.
 * @returns the URL origin, as a string, of the tab that is currently open
 */
export async function getCurrentOpenTabUrl(): Promise<string> {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const { url } = tabs[0];
    if (!url) {
        throw new Error(
            'The URL was not available from the tab. This only happens if the manifest does not include the <tabs> permission.'
        );
    }
    return new URL(url).origin;
}
