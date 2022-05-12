import { getStorageAccessor } from '@shared/storage/access';
import { ChromeStorageKey } from '@shared/storage/types';
import { atom } from 'jotai';

/**
 * @description
 * Create an atom that automatically syncs with chrome local storage.
 */
export const atomWithChromeStorage = <V>(key: ChromeStorageKey, fallback: V) => {
    const { get: getStoredValue, set: setStoredValue } = getStorageAccessor<V>(key);
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
