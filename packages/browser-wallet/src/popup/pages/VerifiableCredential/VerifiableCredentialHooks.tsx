import { grpcClientAtom } from '@popup/store/settings';
import { VerifiableCredential, VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';
import { getVerifiableCredentialStatus } from '@shared/utils/verifiable-credential-helpers';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { storedVerifiableCredentialSchemasAtom } from '@popup/store/verifiable-credential';

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
    }, [schemas]);

    return schema;
}
