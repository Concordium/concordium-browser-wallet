import { atomWithChromeStorage } from './utils';

export type Credential = {
    key: string;
    address: string;
};

// export const keysAtom = atomWithChromeStorage<string[]>('keys', []);
export const credentialsAtom = atomWithChromeStorage<Credential[]>('credentials', []);
export const jsonRpcUrlAtom = atomWithChromeStorage<string | undefined>('url', undefined);
