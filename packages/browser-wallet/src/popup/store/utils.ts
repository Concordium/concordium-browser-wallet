import {
    StorageAccessor,
    storedCredentials,
    storedJsonRpcUrl,
    storedSelectedAccount,
    storedUrlWhitelist,
} from '@shared/storage/access';
import { ChromeStorageKey } from '@shared/storage/types';
import { atom } from 'jotai';

const accessorMap = {
    [ChromeStorageKey.Credentials]: storedCredentials,
    [ChromeStorageKey.SelectedAccount]: storedSelectedAccount,
    [ChromeStorageKey.JsonRpcUrl]: storedJsonRpcUrl,
    [ChromeStorageKey.UrlWhitelist]: storedUrlWhitelist,
};

/**
 * @description
 * Create an atom that automatically syncs with chrome local storage.
 */
export const atomWithChromeStorage = <V>(key: ChromeStorageKey, fallback: V) => {
    const accessor = accessorMap[key] as unknown as StorageAccessor<V>;

    if (accessor === undefined) {
        throw new Error(`Could not find storage for key: ${key}`);
    }

    const { get: getStoredValue, set: setStoredValue } = accessor;
    const base = atom<V | undefined>(undefined);

    base.onMount = (setValue) => {
        getStoredValue().then(setValue);
    };

    const derived = atom(
        async (get) => get(base) ?? (await getStoredValue()) ?? fallback,
        (_, set, next: V) => {
            setStoredValue(next);
            set(base, next);
        }
    );

    return derived;
};
