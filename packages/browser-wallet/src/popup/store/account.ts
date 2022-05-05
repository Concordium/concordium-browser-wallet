import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { credentialsAtom } from './settings';
import { atomWithChromeStorage } from './utils';

const storedAccountAtom = atomWithChromeStorage<string | undefined>('selectedAccount', undefined);
export const selectedAccountAtom = atom<string | undefined, string>(
    (get) => get(storedAccountAtom) ?? get(credentialsAtom)[0]?.address,
    (_, set, address) => {
        set(storedAccountAtom, address);
        // TODO propagate event through message handler.
    }
);

export const accountsAtom = selectAtom(credentialsAtom, (cs) => cs.map((c) => c.address));
