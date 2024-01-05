import { storedCredentials, storedIdentities, storedTokens, useIndexedStorage } from '@shared/storage/access';
import { addToList, editList, updateRecord } from '@shared/storage/update';
import { Identity, WalletCredential } from '@shared/storage/types';
import { identityMatch } from '@shared/utils/identity-helpers';
import { EUROE_MAINNET_INDEX, EUROE_TESTNET_INDEX, euroeTokenStorage } from '@shared/constants/token-metadata';
import { mainnet, testnet } from '@shared/constants/networkConfiguration';

const identityLock = 'concordium_identity_lock';
const credentialLock = 'concordium_credential_lock';
const tokenLock = 'concordium_token_lock';

export async function addIdentity(identity: Identity | Identity[], genesisHash: string): Promise<void> {
    return addToList(
        identityLock,
        identity,
        useIndexedStorage(storedIdentities, async () => genesisHash)
    );
}

// Add the euroe token to the credential(s)
async function addEuroeToken(cred: WalletCredential | WalletCredential[], genesisHash: string): Promise<void> {
    const storage = useIndexedStorage(storedTokens, async () => genesisHash);
    const add = async (index: string) => {
        for (const { address } of Array.isArray(cred) ? cred : [cred]) {
            await updateRecord(tokenLock, storage, address, { [index]: [euroeTokenStorage] });
        }
    };
    switch (genesisHash) {
        case mainnet.genesisHash:
            await add(EUROE_MAINNET_INDEX.toString());
            break;
        case testnet.genesisHash:
            await add(EUROE_TESTNET_INDEX.toString());
            break;
        default:
    }
}

export async function addCredential(cred: WalletCredential | WalletCredential[], genesisHash: string): Promise<void> {
    // All accounts should have euroe token added as default
    addEuroeToken(cred, genesisHash);

    return addToList(
        credentialLock,
        cred,
        useIndexedStorage(storedCredentials, async () => genesisHash)
    );
}

export function updateIdentities(updatedIdentities: Identity[], genesisHash: string) {
    return editList(
        identityLock,
        updatedIdentities,
        identityMatch,
        useIndexedStorage(storedIdentities, async () => genesisHash)
    );
}

export function updateCredentials(updatedCredentials: WalletCredential[], genesisHash: string) {
    return editList(
        credentialLock,
        updatedCredentials,
        (cred) => (candidate) => cred.credId === candidate.credId,
        useIndexedStorage(storedCredentials, async () => genesisHash)
    );
}
