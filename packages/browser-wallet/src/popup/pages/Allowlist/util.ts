export async function updateAllowList(
    urlToUpdate: string,
    allowlist: Record<string, string[]>,
    accountsToAdd: string[],
    setAllowList: (update: Record<string, string[]>) => Promise<void>
) {
    const updatedAllowList: Record<string, string[]> = {
        ...allowlist,
    };
    updatedAllowList[urlToUpdate] = accountsToAdd;
    await setAllowList(updatedAllowList);
}
