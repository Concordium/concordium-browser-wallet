import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';

async function broadcastAccountDisconnectedEvents(disconnectedAccounts: string[], tabUrl: string) {
    for (const disconnectedAccount of disconnectedAccounts) {
        popupMessageHandler.broadcastToUrl(EventType.AccountDisconnected, tabUrl, disconnectedAccount);
    }
}

export async function handleAllowlistEntryUpdate(
    urlToUpdate: string,
    allowlist: Record<string, string[]>,
    accountsToAdd: string[],
    setAllowlist: (update: Record<string, string[]>) => Promise<void>,
    selectedAccount?: string
) {
    const updatedAllowlist: Record<string, string[]> = {
        ...allowlist,
    };
    updatedAllowlist[urlToUpdate] = accountsToAdd;
    await setAllowlist(updatedAllowlist);

    const currentAllowlistedAccounts = allowlist[urlToUpdate] ?? [];
    const removedAccounts = currentAllowlistedAccounts.filter((acc) => !updatedAllowlist[urlToUpdate].includes(acc));
    broadcastAccountDisconnectedEvents(removedAccounts, urlToUpdate);

    if (
        selectedAccount &&
        !currentAllowlistedAccounts.includes(selectedAccount) &&
        accountsToAdd.includes(selectedAccount)
    ) {
        popupMessageHandler.broadcastToUrl(EventType.AccountChanged, urlToUpdate, selectedAccount);
    }
}
