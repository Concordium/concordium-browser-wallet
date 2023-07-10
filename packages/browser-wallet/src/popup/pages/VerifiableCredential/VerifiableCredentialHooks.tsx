import { grpcClientAtom } from '@popup/store/settings';
import { VerifiableCredential, VerifiableCredentialStatus } from '@shared/storage/types';
import { getVerifiableCredentialStatus } from '@shared/utils/verifiable-credential-helpers';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

/**
 * Retrieve the on-chain credential status for a verifiable credential in a registry contract.
 * @param credential the verifiable credential to lookup the status for
 * @returns the status for the given credential
 */
export function useCredentialStatus(credential: VerifiableCredential) {
    const [status, setStatus] = useState<VerifiableCredentialStatus>(VerifiableCredentialStatus.Unknown);
    const client = useAtomValue(grpcClientAtom);

    useEffect(() => {
        getVerifiableCredentialStatus(client, credential.id).then((credentialStatus) => {
            setStatus(credentialStatus);
        });
    }, [credential.id, client]);

    return status;
}
