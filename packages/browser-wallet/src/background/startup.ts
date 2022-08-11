import { HttpProvider } from '@concordium/web-sdk';
import { storedJsonRpcUrl, storedCredentials, storedIdentities } from '@shared/storage/access';

import { Identity, IdentityStatus, WalletCredential } from '@shared/storage/types';
import { IdentityTokenContainer, IdentityProviderIdentityStatus } from 'wallet-common-helpers/lib/utils/identity/types';

/**
 * Continously checks whether pending credentials have been confirmed.
 */
async function monitorAccountStatus() {
    const interval = 10000;
    setTimeout(async function loop() {
        const url = await storedJsonRpcUrl.get();
        const creds = await storedCredentials.get();
        let anyUpdated = false;
        if (url && creds) {
            const updatedCreds: WalletCredential[] = await Promise.all(
                creds.map(async (cred) => {
                    if (cred.status === IdentityStatus.Pending) {
                        const { status, deploymentHash, ...info } = cred;
                        const resp = await new HttpProvider(url, fetch).request('getTransactionStatus', {
                            transactionHash: cred.deploymentHash,
                        });
                        // TODO Improve successful check
                        if (JSON.parse(resp).result.status === 'finalized' && resp.includes('success')) {
                            anyUpdated = true;
                            return { ...info, status: IdentityStatus.Confirmed };
                        }
                    }
                    return cred;
                })
            );
            if (anyUpdated) {
                await storedCredentials.set(updatedCreds);
            }
        }
        setTimeout(loop, interval);
    }, 0);
}

async function monitorIdentityStatus() {
    const interval = 10000;
    setTimeout(async function loop() {
        const url = await storedJsonRpcUrl.get();
        const identities = await storedIdentities.get();
        let anyUpdated = false;
        if (url && identities) {
            const updatedIdentities: Identity[] = await Promise.all(
                identities.map(async (original) => {
                    if (original.status === IdentityStatus.Pending) {
                        const { location, ...identity } = original;
                        const response = (await (await fetch(location)).json()) as IdentityTokenContainer;
                        if (response.status === IdentityProviderIdentityStatus.Error) {
                            anyUpdated = true;
                            return {
                                ...identity,
                                status: IdentityStatus.Rejected,
                                error: response.detail,
                            };
                        }
                        if (response.status === IdentityProviderIdentityStatus.Done) {
                            anyUpdated = true;
                            return {
                                ...identity,
                                status: IdentityStatus.Confirmed,
                                idObject: response.token.identityObject,
                            };
                        }
                    }
                    return original;
                })
            );
            if (anyUpdated) {
                await storedIdentities.set(updatedIdentities);
            }
        }
        setTimeout(loop, interval);
    }, 0);
}

export const startupHandler = () => {
    monitorAccountStatus();
    monitorIdentityStatus();
};
