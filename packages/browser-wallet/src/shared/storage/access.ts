import { ChromeStorageKey, WalletCredential } from './types';

export type StorageAccessor<V> = {
    get(): Promise<V | undefined>;
    set(value: V): Promise<void>;
    remove(): Promise<void>;
};

const makeStorageAccessor = <V>(area: chrome.storage.AreaName, key: ChromeStorageKey): StorageAccessor<V> => {
    const store = chrome.storage[area];
    return {
        get: (): Promise<V | undefined> => store.get(key).then((s) => s[key]),
        set: (value: V) => store.set({ [key]: value }),
        remove: () => store.remove(key),
    };
};

export const storedCredentials = makeStorageAccessor<WalletCredential[]>('local', ChromeStorageKey.Credentials);
export const storedJsonRpcUrl = makeStorageAccessor<string>('local', ChromeStorageKey.JsonRpcUrl);
export const storedSelectedAccount = makeStorageAccessor<string>('local', ChromeStorageKey.SelectedAccount);
export const storedUrlWhitelist = makeStorageAccessor<string[]>('local', ChromeStorageKey.UrlWhitelist);
