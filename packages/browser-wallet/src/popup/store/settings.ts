import { ChromeStorageKey, Theme, WalletCredential } from '@shared/storage/types';
import { atom } from 'jotai';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { atomWithChromeStorage, AsyncWrapper } from './utils';

export const credentialsAtom = atomWithChromeStorage<WalletCredential[]>(ChromeStorageKey.Credentials, []);
export const themeAtom = atomWithChromeStorage<Theme>(ChromeStorageKey.Theme, Theme.Light);
export const urlWhitelistAtom = atomWithChromeStorage<string[]>(ChromeStorageKey.UrlWhitelist, []);

const storedJsonRpcUrlAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.JsonRpcUrl, undefined, true);
export const jsonRpcUrlAtomLoading = atom<AsyncWrapper<string | undefined>, string | undefined>(
    (get) => get(storedJsonRpcUrlAtom),
    (_, set, jsonRpcUrl) => {
        set(storedJsonRpcUrlAtom, jsonRpcUrl);
        popupMessageHandler.broadcast(EventType.ChainChanged, jsonRpcUrl);
    }
);
export const jsonRpcUrlAtom = atom<string | undefined, string | undefined>(
    (get) => get(jsonRpcUrlAtomLoading).value,
    (_, set, jsonRpcUrl) => {
        set(jsonRpcUrlAtomLoading, jsonRpcUrl);
    }
);
