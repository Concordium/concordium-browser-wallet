import React, { useContext, useState } from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtom, useAtomValue } from 'jotai';
import PageHeader from '@popup/shared/PageHeader';
import { VerifiableCredential } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import Button from '@popup/shared/Button';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { noOp } from 'wallet-common-helpers';
import { VerifiableCredentialCardWithStatusFromChain } from '../VerifiableCredential/VerifiableCredentialList';
import { ExportFormat } from './utils';

function DisplayResult({ imported }: { imported: VerifiableCredential[] }) {
    const { t } = useTranslation('verifiableCredentialBackup');
    const { withClose } = useContext(fullscreenPromptContext);

    return (
        <>
            <PageHeader>{t('import.title')}</PageHeader>
            <div className="flex-column">
                {imported.length === 0 && <>{t('import.noImported')}</>}
                {imported.map((credential) => {
                    return (
                        <VerifiableCredentialCardWithStatusFromChain
                            className="verifiable-credential-list__card"
                            credential={credential}
                        />
                    );
                })}
            </div>
            <Button onClick={withClose(noOp)}>{t('close')}</Button>
        </>
    );
}

/**
 * Renders all verifiable credentials that are in the wallet. The credentials
 * are selectable by clicking them, which will move the user to a view containing
 * a single credential.
 */
export default function VerifiableCredentialImport() {
    const [verifiableCredentials, setVerifiableCredentials] = useAtom(storedVerifiableCredentialsAtom);
    const [imported, setImported] = useState<VerifiableCredential[]>();
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const { t } = useTranslation('verifiableCredentialBackup');
    const { withClose } = useContext(fullscreenPromptContext);

    if (schemas.loading || verifiableCredentials.loading) {
        return null;
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const backup: ExportFormat = JSON.parse(await file.text());
            // TODO error handling
            // TODO validation
            // TODO Decrypt
            const credentials = backup.value.credentials.filter(
                (cred) => !(verifiableCredentials.value || []).some((existing) => existing.id === cred.id)
            );
            setVerifiableCredentials([...verifiableCredentials.value, ...credentials]);
            setImported(credentials);
        }
    };

    if (imported) {
        return <DisplayResult imported={imported} />;
    }

    return (
        <>
            <PageHeader>{t('import.title')}</PageHeader>
            <div className="flex-column">
                <input type="file" onChange={(x) => handleImport(x)} />
            </div>
            <Button onClick={withClose(noOp)}>{t('close')}</Button>
        </>
    );
}
