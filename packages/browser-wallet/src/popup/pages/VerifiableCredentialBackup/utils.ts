import { VerifiableCredential } from '@shared/storage/types';

export type VerifiableCredentialExport = {
    credentials: VerifiableCredential[];
};

export type ExportFormat = {
    type: 'concordium-browser-wallet-verifiable-credentials';
    v: number;
    environment: string; // 'testnet' or 'mainnet'
    value: VerifiableCredentialExport;
};
