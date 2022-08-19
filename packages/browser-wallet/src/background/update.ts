import {
    getGenesisHash,
    StorageAccessor,
    storedCredentials,
    storedIdentities,
    useIndexedStorage,
} from '@shared/storage/access';
import { Identity, WalletCredential } from '@shared/storage/types';

const identityLock = 'Concordium_identity_lock';
const credentialLock = 'Concordium_credential_lock';

/**
 * Generic method to add an element to list in storage
 */
async function addToList<Type>(lock: string, addition: Type | Type[], storage: StorageAccessor<Type[]>): Promise<void> {
    return navigator.locks.request(lock, async () => {
        const list = (await storage.get()) || [];
        return storage.set(list.concat(addition));
    });
}

/**
 * Generic method to edit/update elements in a list in storage
 * Note that this replaces the element found by the findPredicate with the edit.
 */
async function editList<Type>(
    lock: string,
    edits: Type[],
    findPredicate: (current: Type) => (candidate: Type) => boolean,
    storage: StorageAccessor<Type[]>
): Promise<void> {
    return navigator.locks.request(lock, async () => {
        const currentList = await storage.get();
        if (!currentList) {
            throw new Error('Attempt to edit non-existing list.');
        }
        const newList = [...currentList];
        for (const updated of edits) {
            const index = currentList.findIndex(findPredicate(updated));
            if (index >= 0) {
                newList[index] = updated;
            }
        }
        await storage.set(newList);
    });
}

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
