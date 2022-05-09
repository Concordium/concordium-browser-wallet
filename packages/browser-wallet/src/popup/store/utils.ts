import { atom } from 'jotai';

export enum ChromeStorageKey {
    Credentials = 'credentials',
    JsonRpcUrl = 'jsonRpcUrl',
}

/**
 * @description
 * Create an atom that automatically syncs with chrome local storage.
 */
export const atomWithChromeStorage = <V>(key: ChromeStorageKey, fallback: V) => {
    const base = atom<V | undefined>(undefined);
    const getValue = async () => (await chrome.storage.local.get(key))[key] as V;

    base.onMount = (setValue) => {
        getValue().then(setValue);
    };

    const derived = atom(
        async (get) => get(base) ?? (await getValue()) ?? fallback,
        (_, set, next: V) => {
            chrome.storage.local.set({ [key]: next });
            set(base, next);
        }
    );

    return derived;
};
