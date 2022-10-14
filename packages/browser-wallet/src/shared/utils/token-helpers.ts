import { Buffer } from 'buffer/';
import { AccountAddress, InstanceInfo, JsonRpcClient } from '@concordium/web-sdk';
import uleb128 from 'leb128/unsigned';
import { TokenMetadata } from '@shared/storage/types';

export interface TokenIdAndMetadata {
    id: string;
    metadataLink: string;
    metadata: TokenMetadata;
}

export interface ContractDetails {
    contractName: string;
    index: bigint;
    subindex: bigint;
}

/**
 * Returns a buffer containing the parameter used to check whether a smart contract is CIS-2 compliant. (Using the CIS-0 view function .supports)
 */
export function getCIS2Identifier(): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeInt16LE(1, 0);
    buf.writeInt8(5, 2);
    buf.write('CIS-2', 3, 5, 'ASCII');
    return buf;
}

/**
 * Returns a buffer containing the parameters used for the CIS-2 view function .tokenMetadata, for the given token id.
 */
export function getMetadataParameter(id: string): Buffer {
    const lengths = Buffer.alloc(3);
    const idBuf = Buffer.from(id, 'hex');
    lengths.writeInt16LE(1, 0);
    lengths.writeInt8(idBuf.length, 2);
    return Buffer.concat([lengths, idBuf]);
}

/**
 * Confirms that the given smart contract instance is CIS-2 compliant
 */
export async function confirmCIS2Contract(
    client: JsonRpcClient,
    instanceInfo: InstanceInfo,
    { contractName, index, subindex }: ContractDetails
): Promise<string | undefined> {
    if (!instanceInfo.methods.includes(`${contractName}.supports`)) {
        return 'Chosen contract does not support CIS-0';
    }
    if (
        !(
            instanceInfo.methods.includes(`${contractName}.balanceOf`) &&
            instanceInfo.methods.includes(`${contractName}.transfer`) &&
            instanceInfo.methods.includes(`${contractName}.tokenMetadata`)
        )
    ) {
        return 'Chosen contract does not expose required endpoints';
    }
    const supports = await client.invokeContract({
        contract: { index, subindex },
        method: `${contractName}.supports`,
        parameter: getCIS2Identifier(),
    });
    if (!supports || supports.tag === 'failure') {
        return 'Unable to invoke chosen contract result';
    }
    if (supports.returnValue !== '010001') {
        return 'Chosen contract does not support CIS-2';
    }
    return undefined;
}

/**
 * Determines the metadata url for the given token.
 */
export function getTokenUrl(
    client: JsonRpcClient,
    id: string,
    { contractName, index, subindex }: ContractDetails
): Promise<string> {
    return new Promise((resolve) => {
        client
            .invokeContract({
                contract: { index, subindex },
                method: `${contractName}.tokenMetadata`,
                parameter: getMetadataParameter(id),
            })
            .then((returnValue) => {
                if (returnValue && returnValue.tag === 'success' && returnValue.returnValue) {
                    const bufferStream = Buffer.from(returnValue.returnValue, 'hex');
                    const length = bufferStream.readUInt16LE(2);
                    const url = bufferStream.slice(4, 4 + length).toString('utf8');
                    resolve(url);
                } else {
                    // Throw an error;
                }
            });
    });
}

/**
 * Fetches token metadata from the given url
 * TODO: add/improve validation of metadata structure.
 */
export async function getTokenMetadata(tokenUrl: string): Promise<TokenMetadata> {
    // TODO remove this hack, for production, or just when we have a proper collection for testing (with online metadata).
    if (tokenUrl.includes('example')) {
        return {
            name: 'Wrapped CCD Token',
            symbol: 'wCCD',
            decimals: 6,
            description: 'A CIS2 token wrapping the Concordium native token (CCD)',
            thumbnail: { url: 'https://proposals.concordium.software/_static/concordium-logo-black.svg' },
            display: { url: 'https://proposals.concordium.software/_static/concordium-logo-black.svg' },
            artifact: { url: 'https://proposals.concordium.software/_static/concordium-logo-black.svg' },
        };
    }
    const resp = await fetch(tokenUrl, { headers: new Headers({ 'Access-Control-Allow-Origin': '*' }), mode: 'cors' });
    if (!resp.ok) {
        throw new Error(`Something went wrong, status: ${resp.status}`);
    }
    return resp.json();
}

/**
 * Serialized based on cis-2 documentation: https://proposals.concordium.software/CIS/cis-2.html#id3
 */
const serializeBalanceParameter = (tokenIndex: string, accountAddress: string) => {
    const queries = Buffer.alloc(2);
    queries.writeUInt16LE(1, 0); // 1 query

    const token = Buffer.from(tokenIndex, 'hex');
    const tokenLength = Buffer.alloc(1);
    tokenLength.writeUInt8(token.length, 0);

    const addressType = Buffer.alloc(1); // Account address type
    const address = new AccountAddress(accountAddress).decodedAddress;

    return Buffer.concat([queries, tokenLength, token, addressType, address]);
};

/**
 * Deserialized based on cis-2 documentation: https://proposals.concordium.software/CIS/cis-2.html#response
 */
const deserializeBalanceAmount = (value: string): bigint => {
    const buf = Buffer.from(value, 'hex');
    const amount = uleb128.decode(buf.slice(2)); // ignore first 2 bytes as we only expect 1 tokenamount

    return BigInt(amount);
};

export const getTokenBalance = async (
    client: JsonRpcClient,
    contractIndex: string,
    tokenIndex: string,
    accountAddress: string
): Promise<bigint> => {
    const index = BigInt(contractIndex);
    const subindex = 0n;
    const instanceInfo = await client.getInstanceInfo({ index, subindex });

    if (instanceInfo === undefined) {
        return 0n;
    }

    const result = await client.invokeContract({
        contract: { index, subindex },
        method: `${instanceInfo.name.substring(5)}.balanceOf`,
        parameter: serializeBalanceParameter(tokenIndex, accountAddress),
    });

    if (result === undefined || result.tag === 'failure' || result.returnValue === undefined) {
        return 0n;
    }

    return deserializeBalanceAmount(result.returnValue);
};
