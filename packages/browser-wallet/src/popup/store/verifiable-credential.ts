import { ChromeStorageKey, VerifiableCredential, VerifiableCredentialSchema } from '@shared/storage/types';
import { atomWithChromeStorage } from './utils';

export const storedVerifiableCredentialsAtom = atomWithChromeStorage<VerifiableCredential[] | undefined>(
    ChromeStorageKey.VerifiableCredentials,
    []
);

export const storedVerifiableCredentialSchemasAtom = atomWithChromeStorage<Record<string, VerifiableCredentialSchema>>(
    ChromeStorageKey.VerifiableCredentialSchemas,
    {},
    true
);
