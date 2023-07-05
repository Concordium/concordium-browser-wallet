import { grpcClientAtom } from '@popup/store/settings';
import { VerifiableCredential, VerifiableCredentialStatus } from '@shared/storage/types';
import {
    CredentialEntry,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    getVerifiableCredentialEntry,
    getVerifiableCredentialStatus,
} from '@shared/utils/verifiable-credential-helpers';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

/**
 * Retrieve the on-chain credential entry for a verifiable credential in a CIS-4 credential registry contract.
 * @param credential the verifiable credential to retrieve the credential entry for
 * @returns the credential entry for the given credential, undefined if one is not found yet
 */
export function useCredentialEntry(credential: VerifiableCredential) {
    const [credentialEntry, setCredentialEntry] = useState<CredentialEntry>();
    const client = useAtomValue(grpcClientAtom);

    useEffect(() => {
        const credentialHolderId = getCredentialHolderId(credential.id);
        const registryContractAddress = getCredentialRegistryContractAddress(credential.id);
        getVerifiableCredentialEntry(client, registryContractAddress, credentialHolderId).then((entry) => {
            setCredentialEntry(entry);
        });
    }, [credential.id, client]);

    return credentialEntry;
}

/**
 * Retrieve the on-chain credential status for a verifiable credential in a CIS-4 credential registry contract.
 * @param credential the verifiable credential to lookup the status for
 * @returns the status for the given credential
 */
export function useCredentialStatus(credential: VerifiableCredential) {
    const [status, setStatus] = useState<VerifiableCredentialStatus>(VerifiableCredentialStatus.Unknown);
    const client = useAtomValue(grpcClientAtom);

    useEffect(() => {
        const credentialHolderId = getCredentialHolderId(credential.id);
        const registryContractAddress = getCredentialRegistryContractAddress(credential.id);
        getVerifiableCredentialStatus(client, registryContractAddress, credentialHolderId).then((credentialStatus) => {
            setStatus(credentialStatus);
        });
    }, [credential.id, client]);

    return status;
}
