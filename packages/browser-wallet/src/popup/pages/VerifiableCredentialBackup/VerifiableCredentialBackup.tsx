import React from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialMetadataAtom,
} from '@popup/store/verifiable-credential';
import { useAtomValue } from 'jotai';
import { NetworkConfiguration, VerifiableCredential, VerifiableCredentialSchema } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import { getNet } from '@shared/utils/network-helpers';
import { networkConfigurationAtom } from '@popup/store/settings';
import { saveData } from '@popup/shared/utils/file-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { encrypt } from '@shared/utils/crypto';
import Topbar from '@popup/shared/Topbar';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VerifiableCredentialMetadata } from '@shared/utils/verifiable-credential-helpers';
import { useHdWallet } from '@popup/shared/utils/account-helpers';
import { ExportFormat } from './utils';

function createExport(
    verifiableCredentials: VerifiableCredential[],
    schemas: Record<string, VerifiableCredentialSchema>,
    metadata: Record<string, VerifiableCredentialMetadata>,
    network: NetworkConfiguration,
    encryptionKey: string
) {
    const exportContent: ExportFormat = {
        type: 'concordium-browser-wallet-verifiable-credentials',
        v: 0,
        environment: getNet(network).toLowerCase(),
        value: {
            verifiableCredentials,
            schemas,
            metadata,
        },
    };

    // TODO don't use key as password;
    // TODO handle bigints
    return encrypt(JSON.stringify(exportContent), encryptionKey);
}

export default function VerifiableCredentialList() {
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const metadata = useAtomValue(storedVerifiableCredentialMetadataAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const nav = useNavigate();
    const { t } = useTranslation('verifiableCredentialBackup');
    const wallet = useHdWallet();

    if (schemas.loading || verifiableCredentials.loading || metadata.loading || !wallet) {
        return null;
    }

    const handleExport = async () => {
        const key = wallet.getVerifiableCredentialBackupEncryptionKey().toString('hex');
        const data = await createExport(verifiableCredentials.value, schemas.value, metadata.value, network, key);
        saveData(data, `web3IdCredentials.export`);
    };

    const handleImport = () => {
        popupMessageHandler.sendInternalMessage(InternalMessageType.LoadWeb3IdBackup).then(() => window.close());
    };

    return (
        <>
            <Topbar title={t('backup.header')} onBackButtonClick={() => nav(-1)} />
            <div className="verifiable-credential-backup">
                <Button className="export-private-key-page__export-button" width="medium" onClick={handleExport}>
                    {t('backup.button.export')}
                </Button>
                <Button className="export-private-key-page__export-button" width="medium" onClick={handleImport}>
                    {t('backup.button.import')}
                </Button>
            </div>
        </>
    );
}
