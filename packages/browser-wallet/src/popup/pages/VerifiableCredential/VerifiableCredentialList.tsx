import React, { useMemo, useState } from 'react';
import {
    storedVerifiableCredentialMetadataAtom,
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtomValue, useAtom } from 'jotai';
import Topbar, { ButtonTypes } from '@popup/shared/Topbar/Topbar';
import { useTranslation } from 'react-i18next';
import { VerifiableCredential, VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';
import {
    VerifiableCredentialMetadata,
    getChangesToCredentialMetadata,
    getChangesToCredentialSchemas,
} from '@shared/utils/verifiable-credential-helpers';
import { Link, useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import {
    useCredentialMetadata,
    useCredentialSchema,
    useCredentialStatus,
    useFetchingEffect,
} from './VerifiableCredentialHooks';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';
import VerifiableCredentialDetails from './VerifiableCredentialDetails';

/**
 * Component to display while loading verifiable credentials from storage.
 */
function LoadingVerifiableCredentials() {
    return <div className="verifiable-credential-wrapper" />;
}

/**
 * Component to display when there are no verifiable credentials in the wallet.
 */
function NoVerifiableCredentials() {
    const { t } = useTranslation('verifiableCredential');
    return (
        <>
            <Topbar title={t('topbar.list')} />
            <div className="verifiable-credential-wrapper">
                <div className="flex-column align-center">
                    <p className="m-t-20 m-h-30">You do not have any verifiable credentials in your wallet.</p>
                </div>
            </div>
        </>
    );
}

export function VerifiableCredentialCardWithStatusFromChain({
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
    const { t } = useTranslation('verifiableCredential');
    const [selected, setSelected] = useState<{
        credential: VerifiableCredential;
        status: VerifiableCredentialStatus;
        schema: VerifiableCredentialSchema;
        metadata: VerifiableCredentialMetadata;
    }>();
    const [schemas, setSchemas] = useAtom(storedVerifiableCredentialSchemasAtom);
    const [storedMetadata, setStoredMetadata] = useAtom(storedVerifiableCredentialMetadataAtom);
    const nav = useNavigate();

    const menuButton = useMemo(() => {
        const backupButton = {
            title: t('menu.backup'),
            onClick: () => nav(absoluteRoutes.home.verifiableCredentials.backup.path),
        };

        return {
            type: ButtonTypes.More,
            items: [backupButton],
        };
    }, [nav]);

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

    if (verifiableCredentials.loading) {
        return <LoadingVerifiableCredentials />;
    }

    if (verifiableCredentials.value.length === 0) {
        return (
            <>
                <Link to={absoluteRoutes.home.verifiableCredentials.backup.path}>Backup</Link>
                <NoVerifiableCredentials />
            </>
        );
    }

    if (selected) {
        return (
            <VerifiableCredentialDetails
                className="verifiable-credential-wrapper__card"
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
            <Topbar title={t('topbar.list')} menuButton={menuButton} />
            <div className="verifiable-credential-wrapper">
                {verifiableCredentials.value.map((credential) => {
                    return (
                        <VerifiableCredentialCardWithStatusFromChain
                            key={credential.id}
                            className="verifiable-credential-wrapper__card"
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
