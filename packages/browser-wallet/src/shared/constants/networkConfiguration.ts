import { NetworkConfiguration } from '@shared/storage/types';

export const mainnet: NetworkConfiguration = {
    genesisHash: '9dd9ca4d19e9393877d2c44b70f89acbfc0883c2243e5eeaecc0d1cd0503f478',
    name: 'Concordium Mainnet',
    explorerUrl: 'https://wallet-proxy.mainnet.concordium.software',
    grpcPort: 20000,
    grpcUrl: 'https://grpc.mainnet.concordium.software',
    ccdScanUrl: 'https://ccdscan.io/',
};

export const testnet: NetworkConfiguration = {
    genesisHash: '4221332d34e1694168c2a0c0b3fd0f273809612cb13d000d5c2e00e85f50f796',
    name: 'Concordium Testnet',
    explorerUrl: 'https://wallet-proxy.testnet.concordium.com',
    grpcPort: 20000,
    grpcUrl: 'https://grpc.testnet.concordium.com',
    ccdScanUrl: 'https://testnet.ccdscan.io/',
};

export const stagenet: NetworkConfiguration = {
    genesisHash: '38bf770b4c247f09e1b62982bb71000c516480c5a2c5214dadac6da4b1ad50e5',
    name: 'Concordium Stagenet',
    explorerUrl: 'https://wallet-proxy.stagenet.concordium.com',
    grpcPort: 20000,
    grpcUrl: 'https://grpc.stagenet.concordium.com',
    ccdScanUrl: 'https://stagenet.ccdscan.io/',
};

export const GRPCTIMEOUT = 15000;
