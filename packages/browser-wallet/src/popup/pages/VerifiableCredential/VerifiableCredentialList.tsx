import React, { useState } from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtomValue } from 'jotai';
import { VerifiableCredential, VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';
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

function VerifiableCredentialCardWithStatusFromChain({
    credential,
    schemas,
    onClick,
}: {
    credential: VerifiableCredential;
    schemas: Record<string, VerifiableCredentialSchema>;
    onClick?: (status: VerifiableCredentialStatus) => void;
}) {
    const status = useCredentialStatus(credential);
    const schema = schemas[credential.credentialSchema.id];

    return (
        <VerifiableCredentialCard
            credential={credential}
            schema={schema}
            onClick={() => {
                if (onClick) {
                    onClick(status);
                }
            }}
            credentialStatus={status}
        />
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
    const [selected, setSelected] = useState<{
        credential: VerifiableCredential;
        status: VerifiableCredentialStatus;
    }>();

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
                credential={selected.credential}
                schema={schemas.value[selected.credential.credentialSchema.id]}
                credentialStatus={selected.status}
            />
        );
    }

    return (
        <div className="verifiable-credential-list">
            {verifiableCredentials.map((credential, index) => {
                return (
                    <VerifiableCredentialCardWithStatusFromChain
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        credential={credential}
                        schemas={schemas.value}
                        onClick={(status: VerifiableCredentialStatus) => setSelected({ credential, status })}
                    />
                );
            })}
        </div>
    );
}
