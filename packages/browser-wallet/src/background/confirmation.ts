import { HttpProvider, JsonRpcClient, TransactionStatusEnum } from '@concordium/web-sdk';
import { storedCurrentNetwork, storedCredentials, storedIdentities } from '@shared/storage/access';
import {
    Identity,
    CreationStatus,
    PendingIdentity,
    PendingWalletCredential,
    WalletCredential,
    NetworkConfiguration,
    BaseIdentity,
    ConfirmedIdentity,
    RejectedIdentity,
} from '@shared/storage/types';
import { not } from '@shared/utils/function-helpers';
import { IdentityTokenContainer, IdentityProviderIdentityStatus } from 'wallet-common-helpers/lib/utils/identity/types';
import { updateCredentials, updateIdentities } from './update';

const isPendingCred = (cred: WalletCredential): cred is PendingWalletCredential =>
    cred.status === CreationStatus.Pending;
const isPendingIdentity = (identity: Identity): identity is PendingIdentity =>
    identity.status === CreationStatus.Pending;
const UPDATE_INTERVAL = 10000;

type ShouldLoop = boolean;

/**
 * Creates a promise, that resolves after given timeout
 */
const timer = (timeout: number): Promise<void> =>
    new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });

/**
 * Takes a loopFun, that runs each UPDATE_INTERVAL, for as long as the loopFun resolves to true
 */
const loop = async (loopFun: () => Promise<ShouldLoop>) => {
    const run = async () => {
        if (await loopFun()) {
            await timer(UPDATE_INTERVAL).then(run);
        }
    };
    await run();
};

let monitoredCredentials: PendingWalletCredential[] = [];

const isCredEqualTo = (c1: PendingWalletCredential) => (c2: PendingWalletCredential) => c1.credId === c2.credId;

const isMonitoringCred = (id: PendingWalletCredential): boolean =>
    monitoredCredentials.find(isCredEqualTo(id)) !== undefined;

async function monitorCredentialStatus(jsonRpcUrl: string, cred: PendingWalletCredential, genesisHash: string) {
    const client = new JsonRpcClient(new HttpProvider(jsonRpcUrl, fetch));
    if (isMonitoringCred(cred)) {
        return;
    }

    monitoredCredentials.push(cred);

    const { deploymentHash, ...info } = cred;

    await loop(async () => {
        const network = await storedCurrentNetwork.get();
        // Stop if the network has changed
        if (!network || network.genesisHash !== genesisHash) {
            monitoredCredentials = [];
            return false;
        }

        try {
            const response = await client.getTransactionStatus(deploymentHash);
            if (response?.status !== TransactionStatusEnum.Finalized) {
                return true;
            }

            const isSuccessful = Object.values(response?.outcomes || {}).some(
                (outcome) => outcome.result.outcome === 'success'
            );
            await updateCredentials(
                [
                    {
                        ...info,
                        status: isSuccessful ? CreationStatus.Confirmed : CreationStatus.Rejected,
                    },
                ],
                genesisHash
            );
            return false;
        } catch {
            return true;
        }
    });

    monitoredCredentials = monitoredCredentials.filter(not(isCredEqualTo(cred)));
}

/**
 * Start checks on all pending credentials on the current network.
 */
async function startMonitoringCredentialStatus(network: NetworkConfiguration) {
    const creds = await storedCredentials.get(network.genesisHash);
    if (creds) {
        await Promise.all([
            creds
                .filter(isPendingCred)
                .map((cred) => monitorCredentialStatus(network.jsonRpcUrl, cred, network.genesisHash)),
        ]);
    }
}

let monitoredIdentities: PendingIdentity[] = [];

const isIdEqualTo = (id1: BaseIdentity) => (id2: BaseIdentity) =>
    id1.index === id2.index && id1.providerIndex === id2.providerIndex;

const isMonitoringIdentity = (id: PendingIdentity): boolean => monitoredIdentities.find(isIdEqualTo(id)) !== undefined;

/**
 * Continously checks whether pending identities have been confirmed or rejected.
 */
async function monitorIdentityStatus(id: PendingIdentity, genesisHash: string) {
    if (isMonitoringIdentity(id)) {
        return;
    }

    monitoredIdentities.push(id);

    const { location, ...identity } = id;

    await loop(async () => {
        const network = await storedCurrentNetwork.get();
        // Stop if the network has changed
        if (!network || network.genesisHash !== genesisHash) {
            monitoredIdentities = [];
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

    monitoredIdentities = monitoredIdentities.filter(not(isIdEqualTo(id)));
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

export function confirmCredential(credential: PendingWalletCredential, jsonRpcUrl: string, genesisHash: string) {
    monitorCredentialStatus(jsonRpcUrl, credential, genesisHash);
}
