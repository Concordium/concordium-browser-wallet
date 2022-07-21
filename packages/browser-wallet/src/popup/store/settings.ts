import { ChromeStorageKey, Identity, PendingIdentity, Theme, WalletCredential } from '@shared/storage/types';
import { atom } from 'jotai';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { atomWithChromeStorage } from './utils';

export const identitiesAtom = atomWithChromeStorage<Identity[]>(ChromeStorageKey.Identities, []);
export const pendingIdentityAtom = atomWithChromeStorage<Omit<PendingIdentity, 'location'> | undefined>(
    ChromeStorageKey.PendingIdentity,
    undefined
);
export const selectedIdentityAtom = atomWithChromeStorage<Identity | undefined>(
    ChromeStorageKey.SelectedIdentity,
    undefined
);

export const credentialsAtom = atomWithChromeStorage<WalletCredential[]>(ChromeStorageKey.Credentials, []);
export const themeAtom = atomWithChromeStorage<Theme>(ChromeStorageKey.Theme, Theme.Light);
export const urlWhitelistAtom = atomWithChromeStorage<string[]>(ChromeStorageKey.UrlWhitelist, []);

const storedJsonRpcUrlAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.JsonRpcUrl, undefined);
export const jsonRpcUrlAtom = atom<string | undefined, string | undefined>(
    (get) => get(storedJsonRpcUrlAtom),
    (_, set, jsonRpcUrl) => {
        set(storedJsonRpcUrlAtom, jsonRpcUrl);
        popupMessageHandler.broadcast(EventType.ChainChanged, jsonRpcUrl);
    }
);
