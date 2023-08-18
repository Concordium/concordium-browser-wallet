import React from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtom, useAtomValue } from 'jotai';
import { NetworkConfiguration, VerifiableCredential } from '@shared/storage/types';
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
import { ExportFormat } from './utils';

function createPlainExport(verifiableCredentials: VerifiableCredential[], network: NetworkConfiguration) {
    const docContent: ExportFormat = {
        type: 'concordium-browser-wallet-verifiable-credentials',
        v: 0,
        environment: getNet(network).toLowerCase(),
        value: {
            credentials: verifiableCredentials,
        },
    };

    return docContent;
}

function createExport(
    verifiableCredentials: VerifiableCredential[],
    network: NetworkConfiguration,
    encryptionKey: string
) {
    const plain = createPlainExport(verifiableCredentials, network);
    // TODO don't use key as password;
    // TODO handle bigints
    return encrypt(JSON.stringify(plain), encryptionKey);
}

/**
 * Renders all verifiable credentials that are in the wallet. The credentials
 * are selectable by clicking them, which will move the user to a view containing
 * a single credential.
 */
export default function VerifiableCredentialList() {
    const [verifiableCredentials] = useAtom(storedVerifiableCredentialsAtom);
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const nav = useNavigate();
    const { t } = useTranslation('verifiableCredentialBackup');

    if (schemas.loading || verifiableCredentials.loading) {
        return null;
    }

    const handleExport = async () => {
        // TODO get key
        const data = await createExport(verifiableCredentials.value, network, 'myKey');
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
