import React, { useContext, useState } from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialMetadataAtom,
} from '@popup/store/verifiable-credential';
import { useAtom } from 'jotai';
import PageHeader from '@popup/shared/PageHeader';
import { EncryptedData, VerifiableCredential } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import Button from '@popup/shared/Button';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { noOp } from 'wallet-common-helpers';
import { decrypt } from '@shared/utils/crypto';
import { useHdWallet } from '@popup/shared/utils/account-helpers';
import JSONBigInt from 'json-bigint';
import { FileInput } from '@popup/shared/Form/FileInput';
import { reviveDateFromTimeStampAttribute } from '@concordium/web-sdk';
import { VerifiableCredentialCardWithStatusFromChain } from '../VerifiableCredential/VerifiableCredentialList';
import { ExportFormat, VerifiableCredentialExport } from './utils';

function DisplayResult({ imported }: { imported: VerifiableCredential[] }) {
    const { t } = useTranslation('verifiableCredentialBackup');

    return (
        <>
            {imported.length === 0 && <p className="verifiable-credential-import__empty">{t('noImported')}</p>}
            {imported.length > 0 && (
                <div className="verifiable-credential-import__list">
                    {imported.map((credential) => {
                        return (
                            <VerifiableCredentialCardWithStatusFromChain
                                key={credential.id}
                                className="verifiable-credential-import__card"
                                credential={credential}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}

async function parseExport(data: EncryptedData, encryptionKey: string): Promise<VerifiableCredentialExport> {
    const decrypted = await decrypt(data, encryptionKey);
    const backup: ExportFormat = JSONBigInt({
        alwaysParseAsBig: true,
        useNativeBigInt: true,
    }).parse(decrypted, reviveDateFromTimeStampAttribute);
    // Change index to number, due to parse changing all numbers to bigints.
    backup.value.verifiableCredentials = backup.value.verifiableCredentials.map((v) => ({
        ...v,
        index: Number(v.index),
    }));
    // TODO validation
    return backup.value;
}

/**
 * Adds items from toAdd that does not exist in stored, using the given update. Returns the items from toAdd that was actually added.
 */
function updateList<T>(stored: T[], toAdd: T[], isEqual: (a: T, b: T) => boolean, update: (updated: T[]) => void): T[] {
    const filtered = toAdd.filter((item) => stored.every((existing) => !isEqual(item, existing)));
    update([...stored, ...filtered]);
    return filtered;
}

/**
 * Adds items from toAdd that does not exist in stored, using the given update.
 */
function updateRecord<T>(
    stored: Record<string, T>,
    toAdd: Record<string, T>,
    update: (updated: Record<string, T>) => Promise<void>
) {
    const updated = { ...stored };
    Object.entries(toAdd).forEach(([key, value]) => {
        if (!stored[key]) {
            updated[key] = value;
        }
    });

    return update(updated);
}

export default function VerifiableCredentialImport() {
    const [storedVerifiableCredentials, setVerifiableCredentials] = useAtom(storedVerifiableCredentialsAtom);
    const [imported, setImported] = useState<VerifiableCredential[]>();
    const [storedSchemas, setSchemas] = useAtom(storedVerifiableCredentialSchemasAtom);
    const [storedMetadata, setMetadata] = useAtom(storedVerifiableCredentialMetadataAtom);
    const { t } = useTranslation('verifiableCredentialBackup');
    const { withClose } = useContext(fullscreenPromptContext);
    const wallet = useHdWallet();
    const [error, setError] = useState<string>();

    if (storedSchemas.loading || storedMetadata.loading || storedVerifiableCredentials.loading || !wallet) {
        return null;
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (file) {
                const encryptedBackup: EncryptedData = JSON.parse(await file.text());
                const key = wallet.getVerifiableCredentialBackupEncryptionKey().toString('hex');
                const { verifiableCredentials, schemas, metadata } = await parseExport(encryptedBackup, key);
                const filteredCredentials = updateList(
                    storedVerifiableCredentials.value,
                    verifiableCredentials,
                    (a, b) => a.id === b.id,
                    setVerifiableCredentials
                );
                await updateRecord(storedSchemas.value, schemas, setSchemas);
                await updateRecord(storedMetadata.value, metadata, setMetadata);
                setImported(filteredCredentials);
            }
        } catch (e) {
            setError(t('error'));
        }
    };

    // TODO drag and drop
    return (
        <>
            <PageHeader className="verifiable-credential-import__header">{t('title')}</PageHeader>
            <div className="verifiable-credential-import">
                {imported && <DisplayResult imported={imported} />}
                {!imported && (
                    <>
                        <FileInput
                            className="verifiable-credential-import__import"
                            onChange={handleImport}
                            buttonTitle={t('importButton')}
                            value={null}
                        />
                        {error && <p className="m-h-10 form-error-message">{error}</p>}
                    </>
                )}
                <Button className="verifiable-credential-import__button" width="wide" onClick={withClose(noOp)}>
                    {t('close')}
                </Button>
            </div>
        </>
    );
}
