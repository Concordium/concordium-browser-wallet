import { StorageAccessor, storedCredentials, storedIdentities } from '@shared/storage/access';
import { Identity, WalletCredential } from '@shared/storage/types';

const identityLock = 'Concordium_identity_lock';
const credentialLock = 'Concordium_credential_lock';

/**
 * Generic method to add an element to list in storage
 */
async function addToList<Type>(lock: string, addition: Type, storage: StorageAccessor<Type[]>): Promise<void> {
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
            return;
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

export async function addIdentity(identity: Identity): Promise<void> {
    return addToList(identityLock, identity, storedIdentities);
}

export async function addCredential(cred: WalletCredential): Promise<void> {
    return addToList(credentialLock, cred, storedCredentials);
}

export function updateIdentities(updatedIdentities: Identity[]) {
    return editList(
        identityLock,
        updatedIdentities,
        (identity) => (candidate) => identity.id === candidate.id,
        storedIdentities
    );
}

export function updateCredentials(updatedCredentials: WalletCredential[]) {
    return editList(
        credentialLock,
        updatedCredentials,
        (cred) => (candidate) => cred.credId === candidate.credId,
        storedCredentials
    );
}
