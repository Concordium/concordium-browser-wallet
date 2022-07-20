import axios from 'axios';

const walletProxy = axios.create({
    baseURL: 'https://wallet-proxy.stagenet.concordium.com',
});

type Hex = string;

// A description of an entity, used for Identity Provider and Anonymity Revoker
export interface Description {
    name: string;
    url: string;
    description: string;
}

// Identity Provider information
export interface IpInfo {
    ipIdentity: number;
    ipDescription: Description;
    ipVerifyKey: Hex;
    ipCdiVerifyKey: Hex;
}

// Structure of the metadata which is provided, about an identityProvider,
// but is not contained in IpInfo.
export interface IdentityProviderMetaData {
    issuanceStart: string;
    icon: string;
    support: string;
}

// Anonymity Revoker information
export interface ArInfo {
    arIdentity: number;
    arDescription: Description;
    arPublicKey: Hex;
}

export interface Global {
    onChainCommitmentKey: string;
    bulletproofGenerators: string;
    genesisString: string;
}

// Reflects the structure of an Identity Provider.
export interface IdentityProvider {
    ipInfo: IpInfo;
    arsInfos: Record<string, ArInfo>; // objects with ArInfo fields (and numbers as field names)
    metadata: IdentityProviderMetaData;
}

export async function getIdentityProviders(): Promise<IdentityProvider[]> {
    const proxyPath = `/v0/ip_info`;
    const response = await walletProxy.get(proxyPath);
    return response.data;
}
