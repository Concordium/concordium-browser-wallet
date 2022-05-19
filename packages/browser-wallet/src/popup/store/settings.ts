import { ChromeStorageKey, WalletCredential } from '@shared/storage/types';
import { atomWithChromeStorage } from './utils';

export const credentialsAtom = atomWithChromeStorage<WalletCredential[]>(ChromeStorageKey.Credentials, []);
export const jsonRpcUrlAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.JsonRpcUrl, undefined);
