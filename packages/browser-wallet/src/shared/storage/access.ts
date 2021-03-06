import { ChromeStorageKey, Theme, WalletCredential } from './types';

export type StorageAccessor<V> = {
    /**
     * Function for getting the stored value.
     */
    get(): Promise<V | undefined>;
    /**
     * Function for setting the setting the stored value. If called with undefined, the key used for storage is entirely removed.
     */
    set(value: V): Promise<void>;
    /**
     * Removes the key used for creation from the store.
     */
    remove(): Promise<void>;
};

/**
 * Factory function for creating a StorageAccessor from a key.
 *
 * @param area storeage area to store value in
 * @param key key used to store value
 */
const makeStorageAccessor = <V>(area: chrome.storage.AreaName, key: ChromeStorageKey): StorageAccessor<V> => {
    const store = chrome.storage[area];
    return {
        get: (): Promise<V | undefined> => store.get(key).then((s) => s[key]),
        set: (value: V) => (value === undefined ? store.remove(key) : store.set({ [key]: value })),
        remove: () => store.remove(key),
    };
};

export const storedCredentials = makeStorageAccessor<WalletCredential[]>('local', ChromeStorageKey.Credentials);
export const storedJsonRpcUrl = makeStorageAccessor<string>('local', ChromeStorageKey.JsonRpcUrl);
export const storedSelectedAccount = makeStorageAccessor<string>('local', ChromeStorageKey.SelectedAccount);
export const storedUrlWhitelist = makeStorageAccessor<string[]>('local', ChromeStorageKey.UrlWhitelist);
export const storedTheme = makeStorageAccessor<Theme>('local', ChromeStorageKey.Theme);
