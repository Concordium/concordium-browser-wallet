import { VerifiableCredentialStatus } from '@shared/storage/types';
import { useEffect, useState } from 'react';

// TODO This function should look up the status in the registry contract.
export function useCredentialStatus() {
    const [status, setStatus] = useState<VerifiableCredentialStatus>(VerifiableCredentialStatus.Unknown);

    useEffect(() => {
        setStatus(VerifiableCredentialStatus.Active);
    }, []);

    return status;
}
