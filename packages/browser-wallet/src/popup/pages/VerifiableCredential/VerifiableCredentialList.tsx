import React, { useState } from 'react';
import {
    storedVerifiableCredentialMetadataAtom,
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtomValue, useAtom } from 'jotai';
import Topbar from '@popup/shared/Topbar/Topbar';
import { useTranslation } from 'react-i18next';
import { VerifiableCredential, VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';
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
import VerifiableCredentialDetails from './VerifiableCredentialDetails';

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
}: {
    credential: VerifiableCredential;
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
            credential={credential}
            schema={schema}
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
    const { t } = useTranslation('verifiableCredential');
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
            <VerifiableCredentialDetails
                credential={selected.credential}
                schema={selected.schema}
                status={selected.status}
                metadata={selected.metadata}
                backButtonOnClick={() => setSelected(undefined)}
            />
        );
    }

    return (
        <>
            <Topbar title={t('topbar.list')} backButton={{ show: false }} />
            <div className="verifiable-credential-list">
                {verifiableCredentials.map((credential) => {
                    return (
                        <VerifiableCredentialCardWithStatusFromChain
                            key={credential.id}
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
        </>
    );
}
