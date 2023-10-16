import { ConcordiumGRPCWebClient, TransactionHash, TransactionStatusEnum } from '@concordium/web-sdk';
import { GRPCTIMEOUT } from '@shared/constants/networkConfiguration';
import { storedCurrentNetwork, storedCredentials, storedIdentities } from '@shared/storage/access';
import {
    Identity,
    CreationStatus,
    PendingIdentity,
    PendingWalletCredential,
    WalletCredential,
    NetworkConfiguration,
    ConfirmedIdentity,
    RejectedIdentity,
} from '@shared/storage/types';
import { loop, not } from '@shared/utils/function-helpers';
import { identityMatch } from '@shared/utils/identity-helpers';
import { IdentityTokenContainer, IdentityProviderIdentityStatus } from 'wallet-common-helpers';
import type { RpcError } from '@protobuf-ts/runtime-rpc';
import { updateCredentials, updateIdentities } from './update';

const isPendingCred = (cred: WalletCredential): cred is PendingWalletCredential =>
    cred.status === CreationStatus.Pending;
const isPendingIdentity = (identity: Identity): identity is PendingIdentity =>
    identity.status === CreationStatus.Pending;
const UPDATE_INTERVAL = 10000;

const monitoredCredentials: Record<string, PendingWalletCredential[] | undefined> = {};
const isCredEqualTo = (c1: PendingWalletCredential) => (c2: PendingWalletCredential) => c1.credId === c2.credId;
const isMonitoringCred = (genesisHash: string, id: PendingWalletCredential): boolean =>
    monitoredCredentials[genesisHash]?.some(isCredEqualTo(id)) ?? false;

async function monitorCredentialStatus(initialNetwork: NetworkConfiguration, cred: PendingWalletCredential) {
    const { genesisHash } = initialNetwork;
    const client = new ConcordiumGRPCWebClient(initialNetwork.grpcUrl, initialNetwork.grpcPort, {
        timeout: GRPCTIMEOUT,
    });
    if (isMonitoringCred(genesisHash, cred)) {
        return;
    }

    if (monitoredCredentials[genesisHash] === undefined) {
        monitoredCredentials[genesisHash] = [];
    }

    monitoredCredentials[genesisHash]?.push(cred);

    const { deploymentHash, ...info } = cred;

    await loop(UPDATE_INTERVAL, async () => {
        const network = await storedCurrentNetwork.get();
        // Stop if the network has changed
        if (!network || network.genesisHash !== genesisHash) {
            return false;
        }

        try {
            const response = await client.getBlockItemStatus(TransactionHash.fromHexString(deploymentHash));
            // transaction has not finalized yet
            if (response?.status !== TransactionStatusEnum.Finalized) {
                return true;
            }

            await updateCredentials(
                [
                    {
                        ...info,
                        status: CreationStatus.Confirmed,
                    },
                ],
                genesisHash
            );
            return false;
        } catch (e) {
            // transaction has been discarded by the node.
            if ((e as RpcError).code === 'NOT_FOUND') {
                await updateCredentials(
                    [
                        {
                            ...info,
                            status: CreationStatus.Rejected,
                        },
                    ],
                    genesisHash
                );
                return false;
            }
            return true;
        }
    });

    monitoredCredentials[genesisHash] = monitoredCredentials[genesisHash]?.filter(not(isCredEqualTo(cred)));
}

/**
 * Start checks on all pending credentials on the current network.
 */
async function startMonitoringCredentialStatus(network: NetworkConfiguration) {
    const creds = await storedCredentials.get(network.genesisHash);
    if (creds) {
        await Promise.all([creds.filter(isPendingCred).map((cred) => monitorCredentialStatus(network, cred))]);
    }
}

const monitoredIdentities: Record<string, PendingIdentity[] | undefined> = {};
const isMonitoringIdentity = (genesisHash: string, id: PendingIdentity): boolean =>
    monitoredIdentities[genesisHash]?.some(identityMatch(id)) ?? false;

/**
 * Continously checks whether pending identities have been confirmed or rejected.
 */
async function monitorIdentityStatus(id: PendingIdentity, genesisHash: string) {
    if (isMonitoringIdentity(genesisHash, id)) {
        return;
    }

    if (monitoredIdentities[genesisHash] === undefined) {
        monitoredIdentities[genesisHash] = [];
    }

    monitoredIdentities[genesisHash]?.push(id);

    const { location, ...identity } = id;

    await loop(UPDATE_INTERVAL, async () => {
        const network = await storedCurrentNetwork.get();
        // Stop if the network has changed
        if (!network || network.genesisHash !== genesisHash) {
            return false;
        }

        try {
            const response = (await (await fetch(location)).json()) as IdentityTokenContainer;

            if (
                ![IdentityProviderIdentityStatus.Error, IdentityProviderIdentityStatus.Done].includes(response.status)
            ) {
                return true;
            }

            type FinalizedIdentityProperties =
                | Pick<ConfirmedIdentity, 'status' | 'idObject'>
                | Pick<RejectedIdentity, 'status' | 'error'>;

            const identityDetails: FinalizedIdentityProperties =
                response.status === IdentityProviderIdentityStatus.Done
                    ? { status: CreationStatus.Confirmed, idObject: response.token.identityObject }
                    : { status: CreationStatus.Rejected, error: response.detail };

            await updateIdentities([{ ...identity, ...identityDetails }], network.genesisHash);

            return false;
        } catch {
            return true;
        }
    });

    monitoredIdentities[genesisHash] = monitoredIdentities[genesisHash]?.filter(not(identityMatch(id)));
}

/**
 * Start checks on all pending identities on the current network.
 */
async function startMonitoringIdentityStatus(genesisHash: string) {
    const identities = await storedIdentities.get(genesisHash);
    if (identities) {
        await Promise.all([identities.filter(isPendingIdentity).map((id) => monitorIdentityStatus(id, genesisHash))]);
    }
}

/**
 * Starts jobs on each pending identity and credential on the current network.
 */
export async function startMonitoringPendingStatus(network: NetworkConfiguration) {
    await Promise.all([startMonitoringCredentialStatus(network), startMonitoringIdentityStatus(network.genesisHash)]);
}

export function confirmIdentity(identity: PendingIdentity, genesisHash: string) {
    monitorIdentityStatus(identity, genesisHash);
}

export function confirmCredential(credential: PendingWalletCredential, network: NetworkConfiguration) {
    monitorCredentialStatus(network, credential);
}
