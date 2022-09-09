import { getGenesisHash, storedCredentials, storedIdentities, useIndexedStorage } from '@shared/storage/access';
import { addToList, editList } from '@shared/storage/update';
import { Identity, WalletCredential } from '@shared/storage/types';

const identityLock = 'concordium_identity_lock';
const credentialLock = 'concordium_credential_lock';

export async function addIdentity(identity: Identity | Identity[]): Promise<void> {
    return addToList(identityLock, identity, useIndexedStorage(storedIdentities, getGenesisHash));
}

export async function addCredential(cred: WalletCredential | WalletCredential[]): Promise<void> {
    return addToList(credentialLock, cred, useIndexedStorage(storedCredentials, getGenesisHash));
}

export function updateIdentities(updatedIdentities: Identity[]) {
    return editList(
        identityLock,
        updatedIdentities,
        (identity) => (candidate) => identity.index === candidate.index,
        useIndexedStorage(storedIdentities, getGenesisHash)
    );
}

export function updateCredentials(updatedCredentials: WalletCredential[]) {
    return editList(
        credentialLock,
        updatedCredentials,
        (cred) => (candidate) => cred.credId === candidate.credId,
        useIndexedStorage(storedCredentials, getGenesisHash)
    );
}
