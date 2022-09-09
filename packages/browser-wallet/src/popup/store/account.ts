import { popupMessageHandler } from '@popup/shared/message-handler';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { ChromeStorageKey, WalletCredential } from '@shared/storage/types';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { atomWithChromeStorage } from './utils';

export const credentialsAtom = atomWithChromeStorage<WalletCredential[]>(ChromeStorageKey.Credentials, [], false, true);

export const storedConnectedSitesAtom = atomWithChromeStorage<Record<string, string[]>>(
    ChromeStorageKey.ConnectedSites,
    {},
    true,
    true
);

const storedAccountAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.SelectedAccount, undefined);
export const selectedAccountAtom = atom<string | undefined, string | undefined>(
    (get) => get(storedAccountAtom),
    (_, set, address) => {
        set(storedAccountAtom, address);
        popupMessageHandler.broadcast(EventType.AccountChanged, address);
    }
);

export const accountsAtom = selectAtom(credentialsAtom, (cs) => cs.map((c) => c.address));

export const accountsPerIdentityAtom = selectAtom(credentialsAtom, (cs) => {
    const map = {} as Record<number, Record<number, string[]>>;
    cs.forEach((cred) => {
        if (!map[cred.providerIndex]) {
            map[cred.providerIndex] = {} as Record<number, string[]>;
        }
        map[cred.providerIndex][cred.identityIndex] = (map[cred.providerIndex][cred.identityIndex] ?? []).concat([
            cred.address,
        ]);
    });
    return map;
});
