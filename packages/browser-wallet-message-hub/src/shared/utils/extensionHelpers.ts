/**
 * Returns the current selected tab - if any.
 */
export async function getCurrentTab(): Promise<chrome.tabs.Tab> {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
