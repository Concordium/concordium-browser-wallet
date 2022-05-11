import { popupMessageHandler } from '@popup/shared/message-handler';
import { EventType } from '@concordium/browser-wallet-message-hub';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { credentialsAtom } from './settings';
import { atomWithChromeStorage, ChromeStorageKey } from './utils';

const storedAccountAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.SelectedAccount, undefined);
export const selectedAccountAtom = atom<string | undefined, string>(
    (get) => get(storedAccountAtom) ?? get(credentialsAtom)[0]?.address,
    (_, set, address) => {
        set(storedAccountAtom, address);
        popupMessageHandler.broadcast(EventType.ChangeAccount, address);
    }
);

export const accountsAtom = selectAtom(credentialsAtom, (cs) => cs.map((c) => c.address));
