import {
    ChromeStorageKey,
    EncryptedData,
    Identity,
    PendingIdentity,
    Theme,
    WalletCredential,
    IdentityProvider,
    NetworkConfiguration,
} from './types';

export type StorageAccessor<V> = {
    /**
     * Function for getting the stored value.
     */
    get(): Promise<V | undefined>;
    /**
     * Function for setting the stored value. If called with undefined, the key used for storage is entirely removed.
     */
    set(value: V): Promise<void>;
    /**
     * Removes the key used for creation from the store.
     */
    remove(): Promise<void>;
    /**
     * Name of the storage area that this accessor uses.
     */
    area: chrome.storage.AreaName;
};

export type IndexedStorageAccessor<V> = {
    /**
     * Function for getting the stored value.
     */
    get(index: string): Promise<V | undefined>;
    /**
     * Function for setting the stored value. If called with undefined, the key used for storage is entirely removed.
     */
    set(index: string, value: V): Promise<void>;
    /**
     * Removes the key used for creation from the store.
     */
    remove(index: string): Promise<void>;
    /**
     * Name of the storage area that this accessor uses.
     */
    area: chrome.storage.AreaName;
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
        area,
    };
};

/**
 * Factory function for creating an IndexedStorageAccessor from a key.
 *
 * @param area storage area to store value in
 * @param key key used to store value
 */
const makeIndexedStorageAccessor = <Value>(
    area: chrome.storage.AreaName,
    key: ChromeStorageKey
): IndexedStorageAccessor<Value> => {
    const inner = makeStorageAccessor<Record<string, Value>>(area, key);
    return {
        get: (index: string) => inner.get().then((s) => (s ? s[index] : undefined)),
        set: async (index: string, value: Value) => {
            const current = await inner.get();
            const updated = { ...current };
            updated[index] = value;
            return inner.set(updated);
        },
        remove: async (index: string) => {
            const current = await inner.get();
            const updated = { ...current };
            delete updated[index];
            return inner.set(updated);
        },
        area,
    };
};

export function useIndexedStorage<V>(
    accessor: IndexedStorageAccessor<V>,
    getIndex: () => Promise<string>
): StorageAccessor<V> {
    return {
        get: () => getIndex().then((index) => accessor.get(index)),
        set: (value: V) => getIndex().then((index) => accessor.set(index, value)),
        remove: () => getIndex().then((index) => accessor.remove(index)),
        area: accessor.area,
    };
}

export const storedIdentities = makeIndexedStorageAccessor<Identity[]>('local', ChromeStorageKey.Identities);
export const storedSelectedIdentity = makeStorageAccessor<string>('local', ChromeStorageKey.SelectedIdentity);
export const storedSeedPhrase = makeStorageAccessor<string>('local', ChromeStorageKey.SeedPhrase);

export const storedConnectedSites = makeStorageAccessor<Record<string, string[]>>(
    'local',
    ChromeStorageKey.ConnectedSites
);
export const storedCredentials = makeIndexedStorageAccessor<WalletCredential[]>('local', ChromeStorageKey.Credentials);
export const storedCurrentNetwork = makeStorageAccessor<NetworkConfiguration>(
    'local',
    ChromeStorageKey.NetworkConfiguration
);
export const storedSelectedAccount = makeStorageAccessor<string>('local', ChromeStorageKey.SelectedAccount);
export const storedEncryptedSeedPhrase = makeStorageAccessor<EncryptedData>('local', ChromeStorageKey.SeedPhrase);
export const storedTheme = makeStorageAccessor<Theme>('local', ChromeStorageKey.Theme);
export const storedIdentityProviders = makeIndexedStorageAccessor<IdentityProvider>(
    'local',
    ChromeStorageKey.IdentityProviders
);
export const sessionPasscode = makeStorageAccessor<string>('session', ChromeStorageKey.Passcode);
export const sessionPendingIdentity = makeStorageAccessor<Omit<PendingIdentity, 'location'>>(
    'session',
    ChromeStorageKey.PendingIdentity
);
export const sessionCreatingCredential = makeStorageAccessor<string>('session', ChromeStorageKey.IsCreatingCredential);
export const sessionAccountInfoCache = makeIndexedStorageAccessor<Record<string, string>>(
    'session',
    ChromeStorageKey.AccountInfoCache
);

export const getGenesisHash = () =>
    storedCurrentNetwork.get().then((network) => {
        if (!network) {
            throw new Error('Indexed storage should not be accessed before setting the network');
        }
        return network.genesisHash;
    });
