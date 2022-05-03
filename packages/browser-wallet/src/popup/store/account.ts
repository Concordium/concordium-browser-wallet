import { atom } from 'jotai';

import { keysAtom } from './settings';
import { atomWithChromeStorage } from './utils';

const storedAccountAtom = atomWithChromeStorage<string | undefined>('selectedAccount', undefined);
export const selectedAccountAtom = atom<string | undefined, string>(
    (get) => get(storedAccountAtom) ?? get(keysAtom)[0],
    (_, set, update) => {
        set(storedAccountAtom, update);
    }
);
