import { ChromeStorageKey, VerifiableCredential } from '@shared/storage/types';
import { atomWithChromeStorage } from './utils';

export const storedVerifiableCredentialsAtom = atomWithChromeStorage<VerifiableCredential[] | undefined>(
    ChromeStorageKey.VerifiableCredentials,
    []
);
