import { grpcClientAtom } from '@popup/store/settings';
import { VerifiableCredential, VerifiableCredentialStatus, VerifiableCredentialSchema } from '@shared/storage/types';
import {
    CredentialQueryResponse,
    VerifiableCredentialMetadata,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    getVerifiableCredentialEntry,
    getVerifiableCredentialStatus,
} from '@shared/utils/verifiable-credential-helpers';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import {
    storedVerifiableCredentialMetadataAtom,
    storedVerifiableCredentialSchemasAtom,
} from '@popup/store/verifiable-credential';
import { AsyncWrapper } from '@popup/store/utils';
import { ConcordiumGRPCClient } from '@concordium/web-sdk';

/**
 * Retrieve the on-chain credential status for a verifiable credential in a registry contract.
 * @param credential the verifiable credential to lookup the status for
 * @returns the status for the given credential
 */
export function useCredentialStatus(credential: VerifiableCredential) {
    const [status, setStatus] = useState<VerifiableCredentialStatus>();
    const client = useAtomValue(grpcClientAtom);

    useEffect(() => {
        getVerifiableCredentialStatus(client, credential.id)
            .then(setStatus)
            .catch(() => setStatus(VerifiableCredentialStatus.Pending));
    }, [credential.id, client]);

    return status;
}

/**
 * Retrieves the schema to be used to render the credential. The schema is found in
 * storage and must be available there.
 * @param credential the verifiable credential to retrieve the schema for
 * @throws if no schema is found in storage for the provided credential
 * @returns the credential's schema used for rendering the credential
 */
export function useCredentialSchema(credential: VerifiableCredential) {
    const [schema, setSchema] = useState<VerifiableCredentialSchema>();
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);

    useEffect(() => {
        if (!schemas.loading) {
            const schemaValue = schemas.value[credential.credentialSchema.id];
            if (!schemaValue) {
                throw new Error(`Attempted to find schema for credentialId: ${credential.id} but none was found!`);
            }
            setSchema(schemaValue);
        }
    }, [schemas.loading]);

    return schema;
}

/**
 * Retrieve the on-chain credential entry for a verifiable credential in a CIS-4 credential registry contract.
 * @param credential the verifiable credential to retrieve the credential entry for
 * @returns the credential entry for the given credential, undefined if one is not found yet
 */
export function useCredentialEntry(credential?: VerifiableCredential) {
    const [credentialEntry, setCredentialEntry] = useState<CredentialQueryResponse>();
    const client = useAtomValue(grpcClientAtom);

    useEffect(() => {
        if (credential) {
            const credentialHolderId = getCredentialHolderId(credential.id);
            const registryContractAddress = getCredentialRegistryContractAddress(credential.id);
            getVerifiableCredentialEntry(client, registryContractAddress, credentialHolderId).then((entry) => {
                setCredentialEntry(entry);
            });
        }
    }, [credential?.id, client]);

    return credentialEntry;
}

/**
 * Retrieves the credential metadata to be used to render the credential. The credential metadata is
 * found in storage and must be available there.
 * @param credential the verifiable credential to retrieve the schema for
 * @throws if no credential metadata is found in storage for the provided credential
 * @returns the credential's metadata used for rendering the credential
 */
export function useCredentialMetadata(credential?: VerifiableCredential) {
    const [metadata, setMetadata] = useState<VerifiableCredentialMetadata>();
    const credentialEntry = useCredentialEntry(credential);
    const storedMetadata = useAtomValue(storedVerifiableCredentialMetadataAtom);

    useEffect(() => {
        if (!storedMetadata.loading && credentialEntry) {
            const storedCredentialMetadata = storedMetadata.value[credentialEntry.credentialInfo.metadataUrl.url];
            if (!storedCredentialMetadata) {
                throw new Error(
                    `Attempted to find credential metadata for credentialId: ${credentialEntry.credentialInfo.credentialHolderId} but none was found!`
                );
            }
            setMetadata(storedCredentialMetadata);
        }
    }, [storedMetadata, credentialEntry]);

    return metadata;
}

/**
 * Retrieves data and uses the provided data setter to update chrome.storage with the changes found.
 * The dataFetcher is responsible for delivering the exact updated picture that should be set.
 * @param credentials the credentials to fetch up to date data for
 * @param storedData the current stored data (that is to be updated)
 * @param setStoredData setter for setting the stored data, should be an atom setter connected to chrome.storage
 * @param dataFetcher the function that fetches updated data
 */
export function useFetchingEffect<T>(
    credentials: AsyncWrapper<VerifiableCredential[]>,
    storedData: AsyncWrapper<Record<string, T>>,
    setStoredData: (update: Record<string, T>) => Promise<void>,
    dataFetcher: (
        credentials: VerifiableCredential[],
        client: ConcordiumGRPCClient,
        abortControllers: AbortController[],
        storedData: Record<string, T>
    ) => Promise<{ data: Record<string, T>; updateReceived: boolean }>
) {
    const client = useAtomValue(grpcClientAtom);

    useEffect(() => {
        let isCancelled = false;
        const abortControllers: AbortController[] = [];

        if (!credentials.loading && credentials.value.length !== 0 && !storedData.loading) {
            dataFetcher(credentials.value, client, abortControllers, storedData.value).then((result) => {
                if (!isCancelled && result.updateReceived) {
                    setStoredData(result.data);
                }
            });
        }

        return () => {
            isCancelled = true;
            abortControllers.forEach((controller) => controller.abort());
        };
    }, [storedData.loading, credentials.loading]);
}
