import { Buffer } from 'buffer/';
import uleb128 from 'leb128/unsigned';
import {
    AccountAddress,
    GtuAmount,
    InstanceInfo,
    JsonRpcClient,
    serializeUpdateContractParameters,
} from '@concordium/web-sdk';
import { MetadataUrl, NetworkConfiguration, TokenMetadata, TokenIdAndMetadata } from '@shared/storage/types';
import { CIS2_SCHEMA_CONTRACT_NAME, CIS2_SCHEMA } from '@popup/constants/schema';
import { WCCD_METADATA } from '@shared/constants/token-metadata';
import { SmartContractParameters } from './types';
import { isMainnet } from './network-helpers';

export interface ContractDetails {
    contractName: string;
    index: bigint;
    subindex: bigint;
}

export type ContractTokenDetails = TokenIdAndMetadata & {
    balance: bigint;
};

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
export function getMetadataParameter(ids: string[]): Buffer {
    const queries = Buffer.alloc(2);
    queries.writeInt16LE(ids.length, 0);

    const idBufs = ids.map((id) => {
        const idBuf = Buffer.from(id, 'hex');
        const length = Buffer.alloc(1);
        length.writeInt8(idBuf.length, 0);

        return Buffer.concat([length, idBuf]);
    });

    return Buffer.concat([queries, ...idBufs]);
}

/**
 * Returns the url for the token metadata.
 * returnValue is assumed to be a HEX-encoded string.
 */
function deserializeTokenMetadataReturnValue(returnValue: string): string[] {
    const buf = Buffer.from(returnValue, 'hex');
    const n = buf.readUInt16LE(0);
    let cursor = 2; // First 2 bytes hold number of token amounts included in response.
    const urls: string[] = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < n; i++) {
        const length = buf.readUInt16LE(cursor);
        const urlStart = cursor + 2;
        const urlEnd = urlStart + length;

        const url = Buffer.from(buf.subarray(urlStart, urlEnd)).toString('utf8');
        urls.push(url);

        cursor = urlEnd + 1;
    }

    return urls;
}

export enum CIS2ConfirmationError {
    Cis0Error,
    Cis2Error,
}

/**
 * Confirms that the given smart contract instance is CIS-2 compliant
 */
export async function confirmCIS2Contract(
    client: JsonRpcClient,
    { contractName, index, subindex }: ContractDetails
): Promise<CIS2ConfirmationError | undefined> {
    const supports = await client.invokeContract({
        contract: { index, subindex },
        method: `${contractName}.supports`,
        parameter: getCIS2Identifier(),
    });
    if (!supports || supports.tag === 'failure') {
        return CIS2ConfirmationError.Cis0Error;
    }

    // Supports return 2 bytes that determine the number of answers. 0100 means there is 1 answer
    // 01 Means the standard is supported.
    // TODO: Handle 02 answer properly (https://proposals.concordium.software/CIS/cis-0.html#response)
    if (supports.returnValue !== '010001') {
        return CIS2ConfirmationError.Cis2Error;
    }
    return undefined;
}

/**
 * Determines the metadata url for the given token.
 */
export function getTokenUrl(
    client: JsonRpcClient,
    ids: string[],
    { contractName, index, subindex }: ContractDetails
): Promise<string[]> {
    return new Promise((resolve, reject) => {
        client
            .invokeContract({
                contract: { index, subindex },
                method: `${contractName}.tokenMetadata`,
                parameter: getMetadataParameter(ids),
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

function confirmMetadataUrl(field?: MetadataUrl) {
    if (field && !field.url) {
        throw new Error('Url field was present but did no contain an url');
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function confirmString(field?: any) {
    if (field && !(typeof field === 'string' || field instanceof String)) {
        throw new Error('string field was present but did no contain a string');
    }
}

/**
 * Fetches token metadata from the given url
 */
export async function getTokenMetadata(tokenUrl: string, network: NetworkConfiguration): Promise<TokenMetadata> {
    // TODO remove this hack when we have a proper collection for testing (with online metadata).
    if (!isMainnet(network) && tokenUrl.includes('https://some.example/token/wccd')) {
        return WCCD_METADATA;
    }
    if (!isMainnet(network) && tokenUrl.includes('https://some.example/token/')) {
        const id = tokenUrl.split('https://some.example/token/')[1]?.toLowerCase() ?? 'fallback';
        return {
            thumbnail: { url: 'https://picsum.photos/40/40' },
            display: { url: 'https://picsum.photos/200/300' },
            name: id.substring(0, 8),
            decimals: 0,
            description: id,
            unique: true,
        };
    }

    const resp = await fetch(tokenUrl, { headers: new Headers({ 'Access-Control-Allow-Origin': '*' }), mode: 'cors' });
    if (!resp.ok) {
        throw new Error(`Something went wrong, status: ${resp.status}`);
    }

    const metadata = await resp.json();

    confirmString(metadata.name);
    confirmString(metadata.symbol);
    confirmString(metadata.description);
    confirmMetadataUrl(metadata.thumbnail);
    if (metadata.decimals && Number.isNaN(metadata.decimals)) {
        throw new Error('Metadata contains incorrect decimals format');
    }
    confirmMetadataUrl(metadata.thumbnail);
    confirmMetadataUrl(metadata.display);
    confirmMetadataUrl(metadata.artifact);

    return metadata;
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
    index: bigint,
    subindex: bigint,
    tokenIds: string[],
    accountAddress: string
): Promise<ContractBalances> => {
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

export type TokenIdentifier = { contractIndex: string; tokenId: string; metadata: TokenMetadata };

export function getTokenTransferParameters(
    from: string,
    to: string,
    tokenId: string,
    amount: bigint
): SmartContractParameters {
    return [
        {
            amount: amount.toString(),
            to: { Account: [to] },
            from: { Account: [from] },
            data: '',
            token_id: tokenId,
        },
    ];
}

function serializeTokenTransferParameters(parameters: SmartContractParameters) {
    return serializeUpdateContractParameters(
        CIS2_SCHEMA_CONTRACT_NAME,
        'transfer',
        parameters,
        Buffer.from(CIS2_SCHEMA, 'base64'),
        1
    );
}

export function getTokenTransferPayload(
    parameters: SmartContractParameters,
    contractName: string,
    maxContractExecutionEnergy: bigint,
    index: bigint,
    subindex = 0n
) {
    return {
        amount: new GtuAmount(0n),
        contractAddress: { index, subindex },
        receiveName: `${contractName}.transfer`,
        parameter: serializeTokenTransferParameters(parameters),
        maxContractExecutionEnergy,
    };
}

async function getTokenTransferExecutionEnergyEstimate(
    client: JsonRpcClient,
    parameter: Buffer,
    invoker: AccountAddress,
    contractName: string,
    index: bigint,
    subindex = 0n
): Promise<bigint> {
    const contractAddress = { index, subindex };
    const res = await client.invokeContract({
        contract: contractAddress,
        invoker,
        parameter,
        method: `${contractName}.transfer`,
    });
    if (!res || res.tag === 'failure') {
        throw new Error(`Expected succesful invocation`);
    }
    // TODO: determine the "safety ratio"
    return (res.usedEnergy * 12n) / 10n;
}

function getContractName(instanceInfo: InstanceInfo): string | undefined {
    return instanceInfo.name.substring(5);
}

export async function fetchContractName(client: JsonRpcClient, index: bigint, subindex = 0n) {
    const instanceInfo = await client.getInstanceInfo({ index, subindex });
    if (!instanceInfo) {
        return undefined;
    }
    return getContractName(instanceInfo);
}

function determineTokenTransferPayloadSize(parameterSize: number, contractName: string) {
    return 8n + 8n + 8n + 2n + BigInt(parameterSize) + 2n + BigInt(contractName.length + 9);
}

// TODO: export this from the SDK or add to helpers
function calculateEnergyCost(signatureCount: bigint, payloadSize: bigint, transactionSpecificCost: bigint): bigint {
    return 100n * signatureCount + 1n * (BigInt(32 + 8 + 8 + 4 + 8) + payloadSize) + transactionSpecificCost;
}

export async function getTokenTransferEnergy(
    client: JsonRpcClient,
    address: string,
    recipient: string,
    tokenId: string,
    contractIndex: bigint
) {
    const parameters = getTokenTransferParameters(address, recipient, tokenId, 1n);
    const serializedParameters = serializeTokenTransferParameters(parameters);
    const contractName = (await fetchContractName(client, contractIndex)) || '';
    const execution = await getTokenTransferExecutionEnergyEstimate(
        client,
        serializedParameters,
        new AccountAddress(address),
        contractName,
        contractIndex
    );
    const total = calculateEnergyCost(
        1n,
        determineTokenTransferPayloadSize(serializedParameters.length, contractName),
        execution
    );
    return { execution, total };
}

const MAX_SYMBOL_LENGTH = 10;

export const trunctateSymbol = (symbol: string): string =>
    symbol.length > MAX_SYMBOL_LENGTH ? `${symbol.substring(0, MAX_SYMBOL_LENGTH)}...` : symbol;
