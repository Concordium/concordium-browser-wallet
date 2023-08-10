import React, { useState } from 'react';
import {
    storedVerifiableCredentialMetadataAtom,
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtom, useAtomValue } from 'jotai';
import { VerifiableCredential, VerifiableCredentialStatus, VerifiableCredentialSchema } from '@shared/storage/types';
import {
    VerifiableCredentialMetadata,
    getChangesToCredentialMetadata,
    getChangesToCredentialSchemas,
} from '@shared/utils/verifiable-credential-helpers';
import {
    useCredentialMetadata,
    useCredentialSchema,
    useCredentialStatus,
    useFetchingEffect,
} from './VerifiableCredentialHooks';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';

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
    onClick,
    className,
}: {
    credential: VerifiableCredential;
    className: string;
    onClick?: (
        status: VerifiableCredentialStatus,
        schema: VerifiableCredentialSchema,
        metadata: VerifiableCredentialMetadata
    ) => void;
}) {
    const status = useCredentialStatus(credential);
    const schema = useCredentialSchema(credential);
    const metadata = useCredentialMetadata(credential);

    // Render nothing until all the required data is available.
    if (!schema || !metadata || status === undefined) {
        return null;
    }

    return (
        <VerifiableCredentialCard
            credentialSubject={credential.credentialSubject}
            schema={schema}
            className={className}
            onClick={() => {
                if (onClick) {
                    onClick(status, schema, metadata);
                }
            }}
            credentialStatus={status}
            metadata={metadata}
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
    const [selected, setSelected] = useState<{
        credential: VerifiableCredential;
        status: VerifiableCredentialStatus;
        schema: VerifiableCredentialSchema;
        metadata: VerifiableCredentialMetadata;
    }>();
    const [schemas, setSchemas] = useAtom(storedVerifiableCredentialSchemasAtom);
    const [storedMetadata, setStoredMetadata] = useAtom(storedVerifiableCredentialMetadataAtom);

    // Hooks that update the stored credential schemas and stored credential metadata.
    useFetchingEffect<VerifiableCredentialMetadata>(
        verifiableCredentials,
        storedMetadata,
        setStoredMetadata,
        getChangesToCredentialMetadata
    );
    useFetchingEffect<VerifiableCredentialSchema>(
        verifiableCredentials,
        schemas,
        setSchemas,
        getChangesToCredentialSchemas
    );

    if (!verifiableCredentials || !verifiableCredentials.length) {
        return <NoVerifiableCredentials />;
    }

    if (selected) {
        return (
            <VerifiableCredentialCard
                className="verifiable-credential-list__card"
                credentialSubject={selected.credential.credentialSubject}
                schema={selected.schema}
                credentialStatus={selected.status}
                metadata={selected.metadata}
            />
        );
    }

    return (
        <div className="verifiable-credential-list">
            {verifiableCredentials.map((credential) => {
                return (
                    <VerifiableCredentialCardWithStatusFromChain
                        key={credential.id}
                        className="verifiable-credential-list__card"
                        credential={credential}
                        onClick={(
                            status: VerifiableCredentialStatus,
                            schema: VerifiableCredentialSchema,
                            metadata: VerifiableCredentialMetadata
                        ) => setSelected({ credential, status, schema, metadata })}
                    />
                );
            })}
        </div>
    );
}
