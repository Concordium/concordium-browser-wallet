import { atomWithChromeStorage, ChromeStorageKey } from './utils';

export type Credential = {
    key: string;
    address: string;
};

export const credentialsAtom = atomWithChromeStorage<Credential[]>(ChromeStorageKey.Credentials, []);
export const jsonRpcUrlAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.JsonRpcUrl, undefined);
