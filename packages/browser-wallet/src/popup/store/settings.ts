import { ChromeStorageKey, Theme, WalletCredential } from '@shared/storage/types';
import { atomWithChromeStorage } from './utils';

export const credentialsAtom = atomWithChromeStorage<WalletCredential[]>(ChromeStorageKey.Credentials, []);
export const jsonRpcUrlAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.JsonRpcUrl, undefined);
export const themeAtom = atomWithChromeStorage<Theme>(ChromeStorageKey.Theme, Theme.Light);
export const urlWhitelistAtom = atomWithChromeStorage<string[]>(ChromeStorageKey.UrlWhitelist, []);
