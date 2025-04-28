import { storedCurrentNetwork } from '@shared/storage/access';

/** Get the CCDscan url for the relevant network */
async function getCcdScanUrl() {
    const currentNetwork = await storedCurrentNetwork.get();
    if (currentNetwork) {
        return currentNetwork.ccdScanUrl;
    }
    throw new Error('Tried to access ccdscan without a loaded network.');
}

/** Open a tab navigated to CCDscan transaction view */
export async function openTransaction(txHash: string) {
    const base = await getCcdScanUrl();
    const url = `${base}?dcount=1&dentity=transaction&dhash=${txHash}`;
    return chrome.tabs.create({ url });
}
