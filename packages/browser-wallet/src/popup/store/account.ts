import { popupMessageHandler } from '@popup/shared/message-handler';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { ChromeStorageKey, WalletCredential } from '@shared/storage/types';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { atomWithChromeStorage } from './utils';

export const credentialsAtomWithLoading = atomWithChromeStorage<WalletCredential[]>(
    ChromeStorageKey.Credentials,
    [],
    true
);
export const credentialsAtom = selectAtom(credentialsAtomWithLoading, (v) => v.value);

export const writableCredentialAtom = atom<WalletCredential[], WalletCredential[]>(
    (get) => get(credentialsAtom),
    async (_, set, update) => {
        await set(credentialsAtomWithLoading, update);
    }
);

export const storedConnectedSitesAtom = atomWithChromeStorage<Record<string, string[]>>(
    ChromeStorageKey.ConnectedSites,
    {},
    true
);

export const storedAllowlistAtom = atomWithChromeStorage<Record<string, string[]>>(
    ChromeStorageKey.Allowlist,
    {},
    true
);

const storedAccountAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.SelectedAccount, undefined);
export const selectedAccountAtom = atom<string | undefined, string | undefined, Promise<void>>(
    (get) => get(storedAccountAtom),
    async (_, set, address) => {
        await set(storedAccountAtom, address);
        popupMessageHandler.broadcast(EventType.AccountChanged, address);
    }
);

export const selectedCredentialAtom = atom<WalletCredential | undefined>((get) => {
    const selectedAccount = get(selectedAccountAtom);
    const credentials = get(credentialsAtom);
    return credentials.find((cred) => cred.address === selectedAccount);
});

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

export const creatingCredentialRequestAtom = atomWithChromeStorage<boolean>(
    ChromeStorageKey.IsCreatingCredential,
    false,
    true
);
