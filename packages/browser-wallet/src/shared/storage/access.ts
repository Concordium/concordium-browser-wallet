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
     * Function for setting the setting the stored value. If called with undefined, the key used for storage is entirely removed.
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

export const storedPendingIdentity = makeStorageAccessor<Omit<PendingIdentity, 'location'>>(
    'local',
    ChromeStorageKey.PendingIdentity
);
export const storedIdentities = makeStorageAccessor<Identity[]>('local', ChromeStorageKey.Identities);
export const storedSelectedIdentity = makeStorageAccessor<string>('local', ChromeStorageKey.SelectedIdentity);
export const storedSeedPhrase = makeStorageAccessor<string>('local', ChromeStorageKey.SeedPhrase);

export const storedConnectedSites = makeStorageAccessor<Record<string, string[]>>(
    'local',
    ChromeStorageKey.ConnectedSites
);
export const storedCredentials = makeStorageAccessor<WalletCredential[]>('local', ChromeStorageKey.Credentials);
export const storedCurrentNetwork = makeStorageAccessor<NetworkConfiguration>(
    'local',
    ChromeStorageKey.NetworkConfiguration
);
export const storedSelectedAccount = makeStorageAccessor<string>('local', ChromeStorageKey.SelectedAccount);
export const storedEncryptedSeedPhrase = makeStorageAccessor<EncryptedData>('local', ChromeStorageKey.SeedPhrase);
export const storedTheme = makeStorageAccessor<Theme>('local', ChromeStorageKey.Theme);
export const storedIdentityProviders = makeStorageAccessor<IdentityProvider>(
    'local',
    ChromeStorageKey.IdentityProviders
);
export const sessionPasscode = makeStorageAccessor<string>('session', ChromeStorageKey.Passcode);
