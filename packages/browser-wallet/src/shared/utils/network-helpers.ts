import { Network, JsonRpcClient, CryptographicParameters } from '@concordium/web-sdk';
import { NetworkConfiguration } from '@shared/storage/types';
import { mainnet } from '@shared/constants/networkConfiguration';

export function isMainnet(network: NetworkConfiguration) {
    return network.genesisHash === mainnet.genesisHash;
}

export function getNet(network: NetworkConfiguration): Network {
    return isMainnet(network) ? 'Mainnet' : 'Testnet';
}

export async function getGlobal(client: JsonRpcClient): Promise<CryptographicParameters> {
    const global = await client.getCryptographicParameters();
    if (!global) {
        throw new Error('no global fetched');
    }
    return global.value;
}

export async function getTermsAndConditionsConfig(
    explorerUrl: string = mainnet.explorerUrl
): Promise<{ version: string; url: string } | undefined> {
    const response = await fetch(`${explorerUrl}/v0/termsAndConditionsVersion`);
    return response.json();
}
