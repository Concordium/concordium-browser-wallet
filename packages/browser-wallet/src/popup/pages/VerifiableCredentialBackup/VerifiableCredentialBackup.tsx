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

type VerifiableCredentialExport = {
    credentials: VerifiableCredential[];
};

type ExportFormat = {
    type: 'concordium-browser-wallet-verifiable-credentials';
    v: number;
    environment: string; // 'testnet' or 'mainnet'
    value: VerifiableCredentialExport;
};

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

function createExport(verifiableCredentials: VerifiableCredential[], network: NetworkConfiguration) {
    const plain = createPlainExport(verifiableCredentials, network);
    // TODO Encrypt
    return plain;
}

/**
 * Renders all verifiable credentials that are in the wallet. The credentials
 * are selectable by clicking them, which will move the user to a view containing
 * a single credential.
 */
export default function VerifiableCredentialList() {
    const [verifiableCredentials, setVerifiableCredentials] = useAtom(storedVerifiableCredentialsAtom);
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const network = useAtomValue(networkConfigurationAtom);

    if (schemas.loading || !verifiableCredentials) {
        return null;
    }

    const handleExport = () => {
        const data = createExport(verifiableCredentials, network);
        saveData(data, `web3IdCredentials.export`);
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const backup: ExportFormat = JSON.parse(await file.text());
            // TODO Decrypt
            const credentials = backup.value.credentials.filter(
                (cred) => !(verifiableCredentials || []).some((existing) => existing.id === cred.id)
            );
            setVerifiableCredentials([...verifiableCredentials, ...credentials]);
        }
    };

    return (
        <div className="flex-column">
            <Button className="export-private-key-page__export-button" width="medium" onClick={handleExport}>
                Download Export
            </Button>
            <input type="file" onChange={(x) => handleImport(x)} />
        </div>
    );
}
