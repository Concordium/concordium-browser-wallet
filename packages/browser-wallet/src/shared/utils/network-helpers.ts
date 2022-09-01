import { Network } from '@concordium/web-sdk';
import { NetworkConfiguration } from '@shared/storage/types';

export const mainnetGenesisHash = '9dd9ca4d19e9393877d2c44b70f89acbfc0883c2243e5eeaecc0d1cd0503f478';

export function isMainnet(network: NetworkConfiguration) {
    return network.genesisHash === mainnetGenesisHash;
}

export function getNet(network: NetworkConfiguration): Network {
    return isMainnet(network) ? 'Mainnet' : 'Testnet';
}
