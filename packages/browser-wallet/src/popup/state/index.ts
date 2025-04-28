import { atom } from 'jotai';
import { ReactNode } from 'react';

export const passcodeAtom = atom<string | undefined>(undefined);
export const toastsAtom = atom<(string | ReactNode)[]>([]);
export const addToastAtom = atom<null, string | ReactNode>(null, (get, set, newToast) => {
    const currentToasts = get(toastsAtom);
    const updatedToasts = [...currentToasts, newToast];
    set(toastsAtom, updatedToasts);
});
