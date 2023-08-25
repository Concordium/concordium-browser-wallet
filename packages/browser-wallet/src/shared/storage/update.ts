import { StorageAccessor } from './access';

export const accountInfoCacheLock = 'concordium_account_info_cache_lock';
export const web3IdCredentialLock = 'concordium_web3_id_credential_lock';

/**
 * Safely updates a record in storage by first acquiring a lock, reading the current value
 * in storage, and updating that value with the provided change, before releasing the lock.
 */
export async function updateRecord<K extends string, V>(
    lock: string,
    storage: StorageAccessor<Record<K, V>>,
    key: K,
    value: V
) {
    navigator.locks.request(lock, async () => {
        const currentRecord = await storage.get();
        let updatedRecord = { ...currentRecord } as Record<K, V>;

        if (currentRecord === undefined) {
            updatedRecord = {
                [key]: value,
            } as Record<K, V>;
        } else {
            updatedRecord[key] = value;
        }

        await storage.set(updatedRecord);
    });
}

/**
 * Generic method to add an element to list in storage
 */
export async function addToList<Type>(
    lock: string,
    addition: Type | Type[],
    storage: StorageAccessor<Type[]>
): Promise<void> {
    return navigator.locks.request(lock, async () => {
        const list = (await storage.get()) || [];
        return storage.set(list.concat(addition));
    });
}

/**
 * Generic method to remove an element from list in storage
 */
export async function removeFromList<Type>(
    lock: string,
    findPredicate: (candidate: Type) => boolean,
    storage: StorageAccessor<Type[]>
): Promise<void> {
    return navigator.locks.request(lock, async () => {
        const list = (await storage.get()) || [];
        const index = list.findIndex(findPredicate);
        if (index > -1) {
            await storage.set(list.splice(index, 1));
        }
    });
}

/*
 * Generic method to add an element to list in storage while ensuring that
 * the list never grows beyond the provided size. If the list is still small
 * enough, then the addition is prepended to the list. If the the list would have
 * grown greater than the max size, then the addition is prepended to the list and
 * the last element of the list is removed.
 */
export async function addToListMaxSize<Type>(
    lock: string,
    addition: Type,
    storage: StorageAccessor<Type[]>,
    size: number
): Promise<void> {
    return navigator.locks.request(lock, async () => {
        const list = (await storage.get()) || [];
        if (list.length < size) {
            return storage.set([addition].concat(list));
        }
        return storage.set([addition].concat(list.slice(0, list.length - 1)));
    });
}

/**
 * Generic method to edit/update elements in a list in storage
 * Note that this replaces the element found by the findPredicate with the edit.
 */
export async function editList<Type>(
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
