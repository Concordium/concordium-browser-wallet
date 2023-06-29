import React, { useState } from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtomValue } from 'jotai';
import { VerifiableCredential } from '@shared/storage/types';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';
import { useCredentialStatus } from './VerifiableCredentialHooks';

/**
 * Component to display when there are no verifiable credentials in the wallet.
 */
function NoVerifiableCredentials() {
    return (
        <div className="flex-column align-center h-full">
            <p className="m-t-20 m-h-30">You do not have any verifiable credentials in your wallet.</p>
        </div>
    );
}

/**
 * Renders all verifiable credentials that are in the wallet. The credentials
 * are selectable by clicking them, which will move the user to a view containing
 * a single credential.
 */
export default function VerifiableCredentialList() {
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const [selected, setSelected] = useState<VerifiableCredential>();

    if (schemas.loading) {
        return null;
    }
    if (!verifiableCredentials || !verifiableCredentials.length) {
        return <NoVerifiableCredentials />;
    }
    if (!Object.keys(schemas.value).length) {
        throw new Error('Attempted to render verifiable credentials, but no schemas were found.');
    } else {
        for (const verifiableCredential of verifiableCredentials) {
            if (!Object.keys(schemas.value).includes(verifiableCredential.credentialSchema.id)) {
                throw new Error(`A credential did not have a corresponding schema: ${verifiableCredential.id}`);
            }
        }
    }

    if (selected) {
        return (
            <VerifiableCredentialCard
                credential={selected}
                schema={schemas.value[selected.credentialSchema.id]}
                useCredentialStatus={(cred) => useCredentialStatus(cred)}
            />
        );
    }

    return (
        <div className="verifiable-credential-list">
            {verifiableCredentials.map((credential, index) => {
                return (
                    <VerifiableCredentialCard
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        credential={credential}
                        schema={schemas.value[credential.credentialSchema.id]}
                        onClick={() => setSelected(credential)}
                        useCredentialStatus={(cred) => useCredentialStatus(cred)}
                    />
                );
            })}
        </div>
    );
}
