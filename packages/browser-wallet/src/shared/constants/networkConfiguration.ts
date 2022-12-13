import { NetworkConfiguration } from '@shared/storage/types';

export const mainnet: NetworkConfiguration = {
    genesisHash: '9dd9ca4d19e9393877d2c44b70f89acbfc0883c2243e5eeaecc0d1cd0503f478',
    name: 'Concordium Mainnet',
    jsonRpcUrl: 'https://json-rpc.mainnet.concordium.software/',
    explorerUrl: 'https://wallet-proxy.mainnet.concordium.software',
};

export const testnet: NetworkConfiguration = {
    genesisHash: '4221332d34e1694168c2a0c0b3fd0f273809612cb13d000d5c2e00e85f50f796',
    name: 'Concordium Testnet',
    jsonRpcUrl: 'https://json-rpc.testnet.concordium.com/',
    explorerUrl: 'https://wallet-proxy.testnet.concordium.com',
};
