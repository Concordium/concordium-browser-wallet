import { storedCredentials, storedIdentities, useIndexedStorage } from '@shared/storage/access';
import { addToList, editList } from '@shared/storage/update';
import { Identity, WalletCredential } from '@shared/storage/types';
import { identityMatch } from '@shared/utils/identity-helpers';

const identityLock = 'concordium_identity_lock';
const credentialLock = 'concordium_credential_lock';

export async function addIdentity(identity: Identity | Identity[], genesisHash: string): Promise<void> {
    return addToList(
        identityLock,
        identity,
        useIndexedStorage(storedIdentities, async () => genesisHash)
    );
}

export async function addCredential(cred: WalletCredential | WalletCredential[], genesisHash: string): Promise<void> {
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
