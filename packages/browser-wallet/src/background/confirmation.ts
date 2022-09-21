import { HttpProvider, JsonRpcClient, TransactionStatusEnum } from '@concordium/web-sdk';
import { storedCurrentNetwork, storedCredentials, storedIdentities } from '@shared/storage/access';
import {
    Identity,
    CreationStatus,
    PendingIdentity,
    PendingWalletCredential,
    WalletCredential,
    NetworkConfiguration,
} from '@shared/storage/types';
import { IdentityTokenContainer, IdentityProviderIdentityStatus } from 'wallet-common-helpers/lib/utils/identity/types';
import { updateCredentials, updateIdentities } from './update';

const isPendingCred = (cred: WalletCredential): cred is PendingWalletCredential =>
    cred.status === CreationStatus.Pending;
const isPendingIdentity = (identity: Identity): identity is PendingIdentity =>
    identity.status === CreationStatus.Pending;
const updateInterval = 10000;

async function monitorCredentialStatus(
    jsonRpcUrl: string,
    { deploymentHash, ...info }: PendingWalletCredential,
    genesisHash: string
) {
    const client = new JsonRpcClient(new HttpProvider(jsonRpcUrl, fetch));
    async function loop() {
        const network = await storedCurrentNetwork.get();
        // Stop if the network has changed
        if (!network || network.genesisHash !== genesisHash) {
            return;
        }
        let repeat = true;
        try {
            const response = await client.getTransactionStatus(deploymentHash);
            if (response?.status === TransactionStatusEnum.Finalized) {
                const isSuccessful = Object.values(response?.outcomes || {}).some(
                    (outcome) => outcome.result.outcome === 'success'
                );
                await updateCredentials([
                    {
                        ...info,
                        status: isSuccessful ? CreationStatus.Confirmed : CreationStatus.Rejected,
                    },
                ]);
                repeat = false;
            }
        } finally {
            if (repeat) {
                setTimeout(loop, updateInterval);
            }
        }
    }
    loop();
}

/**
 * Start checks on all pending credentials on the current network.
 */
async function startMonitoringCredentialStatus(network: NetworkConfiguration) {
    const creds = await storedCredentials.get(network.genesisHash);
    if (creds) {
        creds
            .filter(isPendingCred)
            .forEach((cred) => monitorCredentialStatus(network.jsonRpcUrl, cred, network.genesisHash));
    }
}

/**
 * Continously checks whether pending identities have been confirmed or rejected.
 */
async function monitorIdentityStatus({ location, ...identity }: PendingIdentity, genesisHash: string) {
    async function loop() {
        const network = await storedCurrentNetwork.get();
        // Stop if the network has changed
        if (!network || network.genesisHash !== genesisHash) {
            return;
        }
        let repeat = true;
        try {
            const response = (await (await fetch(location)).json()) as IdentityTokenContainer;
            if (response.status === IdentityProviderIdentityStatus.Error) {
                await updateIdentities([
                    {
                        ...identity,
                        status: CreationStatus.Rejected,
                        error: response.detail,
                    },
                ]);
                repeat = false;
            } else if (response.status === IdentityProviderIdentityStatus.Done) {
                await updateIdentities([
                    {
                        ...identity,
                        status: CreationStatus.Confirmed,
                        idObject: response.token.identityObject,
                    },
                ]);
                repeat = false;
            }
        } finally {
            if (repeat) {
                setTimeout(loop, updateInterval);
            }
        }
    }
    loop();
}

/**
 * Start checks on all pending identities on the current network.
 */
async function startMonitoringIdentityStatus(genesisHash: string) {
    const identities = await storedIdentities.get(genesisHash);
    if (identities) {
        identities.filter(isPendingIdentity).forEach((id) => monitorIdentityStatus(id, genesisHash));
    }
}

/**
 * Starts jobs on each pending identity and credential on the current network.
 * Also sends an abort signal to currently running jobs.
 */
export function startMonitoringPendingStatus(network: NetworkConfiguration) {
    startMonitoringCredentialStatus(network);
    startMonitoringIdentityStatus(network.genesisHash);
}

export function confirmIdentity(identity: PendingIdentity, genesisHash: string) {
    monitorIdentityStatus(identity, genesisHash);
}

export function confirmCredential(credential: PendingWalletCredential, jsonRpcUrl: string, genesisHash: string) {
    monitorCredentialStatus(jsonRpcUrl, credential, genesisHash);
}
