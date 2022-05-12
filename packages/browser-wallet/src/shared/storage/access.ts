import { ChromeStorageKey } from './types';

type StorageAccessor<V> = {
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

export const storedCredentials = makeStorageAccessor('local', ChromeStorageKey.Credentials);
export const storedJsonRpcUrl = makeStorageAccessor('local', ChromeStorageKey.JsonRpcUrl);
export const storedSelectedAccount = makeStorageAccessor('local', ChromeStorageKey.SelectedAccount);

export const accessorMap: Map<ChromeStorageKey, StorageAccessor<unknown>> = new Map([
    [ChromeStorageKey.Credentials, storedCredentials],
    [ChromeStorageKey.JsonRpcUrl, storedCredentials],
    [ChromeStorageKey.SelectedAccount, storedSelectedAccount],
]);

export const getStorageAccessor = <V>(key: ChromeStorageKey): StorageAccessor<V> =>
    accessorMap.get(key) as StorageAccessor<V>;
