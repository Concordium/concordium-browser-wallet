import { atom } from 'jotai';

export const atomWithChromeStorage = <V>(key: string, initialValue: V) => {
    const baseAtom = atom(initialValue);
    baseAtom.onMount = (setValue) => {
        chrome.storage.local.get(key, (v) => setValue(v[key] ?? initialValue));
    };

    const derivedAtom = atom(
        (get) => get(baseAtom),
        (_get, set, next: V) => {
            chrome.storage.local.set({ [key]: next });
            set(baseAtom, next);
        }
    );

    return derivedAtom;
};
