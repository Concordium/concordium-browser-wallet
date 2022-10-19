import { Buffer } from 'buffer/';
import { AccountAddress, InstanceInfo, JsonRpcClient } from '@concordium/web-sdk';
import uleb128 from 'leb128/unsigned';
import { TokenMetadata } from '@shared/storage/types';

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
 * Returns the url for the token metadata.
 * returnValue is assumed to be a HEX-encoded string.
 */
function deserializeTokenMetadataReturnValue(returnValue: string) {
    const bufferStream = Buffer.from(returnValue, 'hex');
    const length = bufferStream.readUInt16LE(2);
    const url = Buffer.from(bufferStream.subarray(4, 4 + length)).toString('utf8');
    return url;
}

// Methods in the CIS2 standard.
const CIS2Methods = ['balanceOf', 'transfer', 'tokenMetadata', 'operatorOf', 'updateOperator'];

/**
 * Confirms that the given smart contract instance is CIS-2 compliant
 */
export async function confirmCIS2Contract(
    client: JsonRpcClient,
    instanceInfo: InstanceInfo,
    { contractName, index, subindex }: ContractDetails
): Promise<string | undefined> {
    const cis0SupportsMethod = `${contractName}.supports`;
    if (!instanceInfo.methods.includes(cis0SupportsMethod)) {
        return 'Chosen contract does not support CIS-0';
    }
    if (!CIS2Methods.every((method) => instanceInfo.methods.includes(`${contractName}.${method}`))) {
        return 'Chosen contract does not expose required endpoints';
    }
    const supports = await client.invokeContract({
        contract: { index, subindex },
        method: cis0SupportsMethod,
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
    return new Promise((resolve, reject) => {
        client
            .invokeContract({
                contract: { index, subindex },
                method: `${contractName}.tokenMetadata`,
                parameter: getMetadataParameter(id),
            })
            .then((returnValue) => {
                if (returnValue && returnValue.tag === 'success' && returnValue.returnValue) {
                    resolve(deserializeTokenMetadataReturnValue(returnValue.returnValue));
                } else {
                    // TODO: perhaps we need to make this error more precise
                    reject(new Error('Token does not exist in this contract'));
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
const serializeBalanceParameter = (tokenIds: string[], accountAddress: string) => {
    const queries = Buffer.alloc(2);
    queries.writeUInt16LE(tokenIds.length, 0);

    const tokens = tokenIds.reduce((acc, t) => {
        const token = Buffer.from(t, 'hex');
        const tokenLength = Buffer.alloc(1);
        tokenLength.writeUInt8(token.length, 0);

        const addressType = Buffer.alloc(1); // Account address type
        const address = new AccountAddress(accountAddress).decodedAddress;

        return Buffer.concat([acc, tokenLength, token, addressType, address]);
    }, queries);

    return tokens;
};

/**
 * Deserialized based on cis-2 documentation: https://proposals.concordium.software/CIS/cis-2.html#response
 */
const deserializeBalanceAmounts = (value: string): bigint[] => {
    const buf = Buffer.from(value, 'hex');
    const n = buf.readUInt16LE(0);
    let cursor = 2; // First 2 bytes hold number of token amounts included in response.
    const amounts: bigint[] = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < n; i++) {
        const end = buf.subarray(cursor).findIndex((b) => b < 2 ** 7) + 1; // Find the first byte with most significant bit not set, signaling the last byte in the leb128 slice.

        const amount = uleb128.decode(Buffer.from(buf.subarray(cursor, cursor + end)));
        amounts.push(BigInt(amount));

        cursor += end;
    }

    return amounts;
};

export type ContractBalances = Record<string, bigint>;

export const getContractBalances = async (
    client: JsonRpcClient,
    contractIndex: string,
    tokenIds: string[],
    accountAddress: string
): Promise<ContractBalances> => {
    const index = BigInt(contractIndex);
    const subindex = 0n;
    const instanceInfo = await client.getInstanceInfo({ index, subindex });

    if (instanceInfo === undefined) {
        return {};
    }

    const result = await client.invokeContract({
        contract: { index, subindex },
        method: `${instanceInfo.name.substring(5)}.balanceOf`,
        parameter: serializeBalanceParameter(tokenIds, accountAddress),
    });

    if (result === undefined || result.tag === 'failure' || result.returnValue === undefined) {
        return {};
    }

    const amounts = deserializeBalanceAmounts(result.returnValue);

    if (amounts.length !== tokenIds.length) {
        throw new Error('Mismatch between length of requested tokens and token amounts in response.');
    }

    return tokenIds.reduce<ContractBalances>(
        (acc, cur, i) => ({
            ...acc,
            [cur]: amounts[i],
        }),
        {}
    );
};
