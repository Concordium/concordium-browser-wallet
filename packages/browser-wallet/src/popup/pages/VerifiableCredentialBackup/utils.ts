import { VerifiableCredential, VerifiableCredentialSchema } from '@shared/storage/types';
import { VerifiableCredentialMetadata } from '@shared/utils/verifiable-credential-helpers';

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
