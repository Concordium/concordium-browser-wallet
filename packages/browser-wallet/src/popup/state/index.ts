import { atom } from 'jotai';

export const passcodeAtom = atom<string | undefined>(undefined);
export const seedPhraseAtom = atom<string | undefined>(undefined);

export const toastsAtom = atom<string[]>([]);
export const toastAtom = atom<string[], string>(
    (get) => get(toastsAtom),
    (get, set, newToast) => {
        const currentToasts = get(toastsAtom);
        const updatedToasts = [...currentToasts, newToast];
        set(toastsAtom, updatedToasts);
    }
);
