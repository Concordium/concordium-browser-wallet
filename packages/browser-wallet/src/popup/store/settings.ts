import { atomWithChromeStorage } from './utils';

export const keysAtom = atomWithChromeStorage<string[]>('keys', []);
export const jsonRpcUrlAtom = atomWithChromeStorage<string | undefined>('url', undefined);
