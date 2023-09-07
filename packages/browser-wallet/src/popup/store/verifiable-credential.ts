import { ChromeStorageKey, VerifiableCredential, VerifiableCredentialSchema } from '@shared/storage/types';
import { VerifiableCredentialMetadata } from '@shared/utils/verifiable-credential-helpers';
import { atomWithChromeStorage } from './utils';

export const storedVerifiableCredentialsAtom = atomWithChromeStorage<VerifiableCredential[]>(
    ChromeStorageKey.VerifiableCredentials,
    [],
    true
);

export const storedVerifiableCredentialSchemasAtom = atomWithChromeStorage<Record<string, VerifiableCredentialSchema>>(
    ChromeStorageKey.VerifiableCredentialSchemas,
    {},
    true
);

export const storedVerifiableCredentialMetadataAtom = atomWithChromeStorage<
    Record<string, VerifiableCredentialMetadata>
>(ChromeStorageKey.VerifiableCredentialMetadata, {}, true);

export const sessionTemporaryVerifiableCredentialsAtom = atomWithChromeStorage<
    Omit<VerifiableCredential, 'signature' | 'randomness'>[]
>(ChromeStorageKey.TemporaryVerifiableCredentials, [], true);

export const sessionTemporaryVerifiableCredentialMetadataUrlsAtom = atomWithChromeStorage<Record<string, string>>(
    ChromeStorageKey.TemporaryVerifiableCredentialMetadataUrls,
    {},
    true
);
