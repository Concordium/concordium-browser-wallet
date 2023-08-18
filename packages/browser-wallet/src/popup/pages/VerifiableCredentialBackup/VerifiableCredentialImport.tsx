import React, { useContext, useState } from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtom, useAtomValue } from 'jotai';
import PageHeader from '@popup/shared/PageHeader';
import { EncryptedData, VerifiableCredential } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import Button from '@popup/shared/Button';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { noOp } from 'wallet-common-helpers';
import { decrypt } from '@shared/utils/crypto';
import { VerifiableCredentialCardWithStatusFromChain } from '../VerifiableCredential/VerifiableCredentialList';
import { ExportFormat } from './utils';

function DisplayResult({ imported }: { imported: VerifiableCredential[] }) {
    const { t } = useTranslation('verifiableCredentialBackup');
    const { withClose } = useContext(fullscreenPromptContext);

    return (
        <>
            <PageHeader>{t('import.title')}</PageHeader>
            <div className="verifiable-credential-import">
                {imported.length === 0 && (
                    <p className="verifiable-credential-import__empty">{t('import.noImported')}</p>
                )}
                {imported.length > 0 && (
                    <div className="verifiable-credential-import__list">
                        {imported.map((credential) => {
                            return (
                                <VerifiableCredentialCardWithStatusFromChain
                                    className="verifiable-credential-import__card"
                                    credential={credential}
                                />
                            );
                        })}
                    </div>
                )}
                <Button className="verifiable-credential-import__button" width="wide" onClick={withClose(noOp)}>
                    {t('close')}
                </Button>
            </div>
        </>
    );
}

async function parseExport(data: EncryptedData, encryptionKey: string): Promise<VerifiableCredential[]> {
    // TODO handle bigints
    // TODO don't use key as password;
    const backup: ExportFormat = JSON.parse(await decrypt(data, encryptionKey));
    // TODO validation
    return backup.value.credentials;
}

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
            // TODO error handling
            const encryptedBackup: EncryptedData = JSON.parse(await file.text());
            // TODO get key
            const credentials = await parseExport(encryptedBackup, 'myKey');
            const filteredCredentials = credentials.filter(
                (cred) => !(verifiableCredentials.value || []).some((existing) => existing.id === cred.id)
            );
            setVerifiableCredentials([...verifiableCredentials.value, ...filteredCredentials]);
            setImported(filteredCredentials);
        }
    };

    if (imported) {
        return <DisplayResult imported={imported} />;
    }

    // TODO drag and drop
    return (
        <>
            <PageHeader>{t('import.title')}</PageHeader>
            <div className="verifiable-credential-import">
                <input type="file" onChange={handleImport} />
                <Button className="verifiable-credential-import__button" width="wide" onClick={withClose(noOp)}>
                    {t('close')}
                </Button>
            </div>
        </>
    );
}
