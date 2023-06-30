import React, { useState } from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtomValue } from 'jotai';
import { VerifiableCredential } from '@shared/storage/types';
import Topbar, { ButtonTypes } from '@popup/shared/Topbar/Topbar';
import { useTranslation } from 'react-i18next';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';
import { useCredentialStatus } from './VerifiableCredentialHooks';
import RevokeIcon from '../../../assets/svg/revoke.svg';

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
    const { t } = useTranslation('verifiableCredential');

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
        const menuButton = { type: ButtonTypes.More, items: [{ title: t('menu.revoke'), icon: <RevokeIcon /> }] };

        return (
            <>
                <Topbar
                    title={t('topbar.details')}
                    backButton={{ show: true, onClick: () => setSelected(undefined) }}
                    menuButton={menuButton}
                />
                <div className="verifiable-credential-list">
                    <VerifiableCredentialCard
                        credential={selected}
                        schema={schemas.value[selected.credentialSchema.id]}
                        useCredentialStatus={(cred) => useCredentialStatus(cred)}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <Topbar title={t('topbar.list')} backButton={{ show: false }} />
            <div className="verifiable-credential-list">
                {verifiableCredentials.map((credential) => {
                    return (
                        <VerifiableCredentialCard
                            key={credential.id}
                            credential={credential}
                            schema={schemas.value[credential.credentialSchema.id]}
                            onClick={() => setSelected(credential)}
                            useCredentialStatus={(cred) => useCredentialStatus(cred)}
                        />
                    );
                })}
            </div>
        </>
    );
}
