import { useHdWallet } from '@popup/shared/utils/account-helpers';
import { NetworkConfiguration, VerifiableCredential, VerifiableCredentialSchema } from '@shared/storage/types';
import { VerifiableCredentialMetadata } from '@shared/utils/verifiable-credential-helpers';
import { encrypt } from '@shared/utils/crypto';
import { getNet } from '@shared/utils/network-helpers';
import { useAtomValue } from 'jotai';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialMetadataAtom,
} from '@popup/store/verifiable-credential';
import { networkConfigurationAtom } from '@popup/store/settings';
import { saveData } from '@popup/shared/utils/file-helpers';
import { stringify } from 'json-bigint';

export type VerifiableCredentialExport = {
    verifiableCredentials: VerifiableCredential[];
    schemas: Record<string, VerifiableCredentialSchema>;
    metadata: Record<string, VerifiableCredentialMetadata>;
};

export type ExportFormat = {
    type: 'concordium-browser-wallet-verifiable-credentials';
    v: number;
    environment: string; // 'testnet' or 'mainnet'
    value: VerifiableCredentialExport;
};

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

    // Use json-bigint to serialize bigints as json numbers.
    // Ensure that Dates are stored as timestamps to not lose typing (otherwise they are serialized as strings).
    return encrypt(stringify(exportContent), encryptionKey);
}

export function useVerifiableCredentialExport() {
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    const metadata = useAtomValue(storedVerifiableCredentialMetadataAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const wallet = useHdWallet();

    if (schemas.loading || verifiableCredentials.loading || metadata.loading || !wallet) {
        return undefined;
    }

    const handleExport = async () => {
        const key = wallet.getVerifiableCredentialBackupEncryptionKey().toString('hex');
        const data = await createExport(verifiableCredentials.value, schemas.value, metadata.value, network, key);
        saveData(data, `web3IdCredentials.export`);
    };

    return handleExport;
}
