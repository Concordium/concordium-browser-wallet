import React, { useState } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { FileInput } from '@popup/popupX/shared/Form/FileInput';
import { FileInputValue } from '@popup/popupX/shared/Form/FileInput/FileInput';
import { useAtom } from 'jotai';
import {
    storedVerifiableCredentialMetadataAtom,
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { EncryptedData, VerifiableCredential } from '@shared/storage/types';
import { useHdWallet } from '@popup/shared/utils/account-helpers';
import JSONBigInt from 'json-bigint';
import { decrypt } from '@shared/utils/crypto';
import Web3IdCard from '@popup/popupX/shared/Web3IdCard';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { ExportFormat, VerifiableCredentialExport } from './utils';

async function parseExport(data: EncryptedData, encryptionKey: string): Promise<VerifiableCredentialExport> {
    const decrypted = await decrypt(data, encryptionKey);
    const backup: ExportFormat = JSONBigInt({
        alwaysParseAsBig: true,
        useNativeBigInt: true,
    }).parse(decrypted);
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

export default function Web3IdImport() {
    const { t } = useTranslation('x', { keyPrefix: 'web3Id.import' });
    const [files, setFiles] = useState<FileInputValue>(null);
    const [storedVerifiableCredentials, setVerifiableCredentials] = useAtom(storedVerifiableCredentialsAtom);
    const [imported, setImported] = useState<VerifiableCredential[]>();
    const [storedSchemas, setSchemas] = useAtom(storedVerifiableCredentialSchemasAtom);
    const [storedMetadata, setMetadata] = useAtom(storedVerifiableCredentialMetadataAtom);
    const wallet = useHdWallet();
    const [error, setError] = useState<string>();
    const nav = useNavigate();

    if (storedSchemas.loading || storedMetadata.loading || storedVerifiableCredentials.loading || !wallet) {
        return null;
    }

    const handleImport = async (imports: FileInputValue) => {
        setFiles(imports);

        if (imports === null) {
            return;
        }

        try {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < imports.length; i++) {
                const file = imports[i];
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
            }
        } catch (e) {
            setError(t('error'));
        }
    };

    if (imported !== undefined) {
        return (
            <Page className="web3-id-x import">
                <Page.Top heading={t('success')} />
                <Page.Main>
                    {imported.length === 0 && <Text.Capture>{t('noCreds')}</Text.Capture>}
                    {imported.map((cred) => (
                        <Web3IdCard credential={cred} />
                    ))}
                </Page.Main>
                <Page.Footer>
                    <Button.Main
                        className="m-t-10"
                        label={t('buttonDone')}
                        onClick={() => nav(absoluteRoutes.settings.web3Id.path)}
                    />
                </Page.Footer>
            </Page>
        );
    }

    return (
        <Page className="web3-id-x import">
            <Page.Top heading={t('importWeb3Id')} />
            <Page.Main>
                <FileInput
                    className="flex-child-fill"
                    value={files}
                    onChange={handleImport}
                    valid={error === undefined}
                    error={error}
                    placeholder={t('dragAndDropFile')}
                />
            </Page.Main>
        </Page>
    );
}
