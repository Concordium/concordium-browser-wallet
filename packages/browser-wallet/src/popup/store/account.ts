import { popupMessageHandler } from '@popup/shared/message-handler';
import { EventType } from '@concordium/browser-wallet-message-hub';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { ChromeStorageKey } from '@shared/storage/types';
import { credentialsAtom } from './settings';
import { atomWithChromeStorage } from './utils';

const storedAccountAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.SelectedAccount, undefined);
export const selectedAccountAtom = atom<string | undefined, string>(
    (get) => get(storedAccountAtom),
    (_, set, address) => {
        set(storedAccountAtom, address);
        popupMessageHandler.broadcast(EventType.ChangeAccount, address);
    }
);

export const accountsAtom = selectAtom(credentialsAtom, (cs) => cs.map((c) => c.address));
