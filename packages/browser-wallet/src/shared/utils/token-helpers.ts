import { Buffer } from 'buffer/';
import uleb128 from 'leb128/unsigned';
import {
    AccountAddress,
    calculateEnergyCost,
    CcdAmount,
    InstanceInfo,
    ConcordiumGRPCClient,
    serializeUpdateContractParameters,
    UpdateContractPayload,
    sha256,
    ContractAddress,
    Parameter,
    ReceiveName,
    ReturnValue,
    ContractName,
    EntrypointName,
    Energy,
    CIS2Contract,
} from '@concordium/web-sdk';
import { MetadataUrl, TokenMetadata, TokenIdAndMetadata } from '@shared/storage/types';
import { CIS2_SCHEMA_CONTRACT_NAME, CIS2_SCHEMA } from '@popup/constants/schema';
import i18n from '@popup/shell/i18n';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import { determineUpdatePayloadSize } from './energy-helpers';
import { applyExecutionNRGBuffer } from './contract-helpers';

export interface ContractDetails {
    contractName: string;
    index: bigint;
    subindex: bigint;
}

export type ContractTokenDetails = TokenIdAndMetadata & {
    balance: bigint;
    error?: string;
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
 * Confirms that the given smart contract instance is CIS-2 compliant
 */
export async function confirmCIS2Contract(
    client: ConcordiumGRPCClient,
    { contractName, index, subindex }: ContractDetails
): Promise<string | undefined> {
    const supports = await client.invokeContract({
        contract: ContractAddress.create(index, subindex),
        method: ReceiveName.fromString(`${contractName}.supports`),
        parameter: Parameter.fromBuffer(getCIS2Identifier()),
    });
    if (!supports || supports.tag === 'failure') {
        return i18n.t('addTokens.cis0Error');
    }

    // Supports return 2 bytes that determine the number of answers. 0100 means there is 1 answer
    // 01 Means the standard is supported.
    // TODO: Handle 02 answer properly (https://proposals.concordium.software/CIS/cis-0.html#response)
    if (supports.returnValue === undefined || ReturnValue.toHexString(supports.returnValue) !== '010001') {
        return i18n.t('addTokens.cis2Error');
    }

    return undefined;
}

function confirmMetadataUrl(field?: MetadataUrl) {
    if (field && !field.url) {
        throw new Error(i18n.t('addTokens.metadata.incorrectUrlField'));
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function confirmString(field?: any) {
    if (field && !(typeof field === 'string' || field instanceof String)) {
        throw new Error(i18n.t('addTokens.metadata.incorrectStringField'));
    }
}

export const getMetadataUnique = ({ unique }: TokenMetadata) => Boolean(unique);
export const getMetadataDecimals = ({ decimals }: TokenMetadata) => Number(decimals ?? 0);

/**
 * Fetches token metadata from the given url
 */
export async function getTokenMetadata({ url, hash: checksumHash }: MetadataUrl): Promise<TokenMetadata> {
    const resp = await fetch(url, { headers: new Headers({ 'Access-Control-Allow-Origin': '*' }), mode: 'cors' });
    if (!resp.ok) {
        throw new Error(i18n.t('addTokens.metadata.fetchError', { status: resp.status }));
    }

    const body = Buffer.from(await resp.arrayBuffer());
    if (checksumHash && sha256([body]).toString('hex') !== checksumHash) {
        throw new Error(i18n.t('addTokens.metadata.incorrectChecksum'));
    }

    let metadata;
    try {
        metadata = JSON.parse(body.toString());
    } catch (e) {
        throw new Error(i18n.t('addTokens.metadata.invalidJSON'));
    }

    confirmString(metadata.name);
    confirmString(metadata.symbol);
    confirmString(metadata.description);
    confirmMetadataUrl(metadata.thumbnail);
    if (metadata.decimals !== undefined && Number.isNaN(getMetadataDecimals(metadata))) {
        throw new Error(i18n.t('addTokens.metadata.incorrectDecimalFormat'));
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
        const address = AccountAddress.fromBase58(accountAddress).decodedAddress;

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

export type ContractBalances = Record<string, bigint | undefined>;

export const getContractBalances = async (
    client: ConcordiumGRPCClient,
    contractDetails: ContractDetails,
    tokenIds: string[],
    accountAddress: string,
    onError?: (error: string) => void
): Promise<ContractBalances> => {
    const result = await client.invokeContract({
        contract: ContractAddress.create(contractDetails.index, contractDetails.subindex),
        method: ReceiveName.fromString(`${contractDetails.contractName}.balanceOf`),
        parameter: Parameter.fromBuffer(serializeBalanceParameter(tokenIds, accountAddress)),
    });

    if (result === undefined || result.tag === 'failure' || result.returnValue === undefined) {
        onError?.(`Failed to retrieve balances for index ${contractDetails.index.toString()}`);
        return {};
    }

    const amounts = deserializeBalanceAmounts(ReturnValue.toHexString(result.returnValue));

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
        ContractName.fromString(CIS2_SCHEMA_CONTRACT_NAME),
        EntrypointName.fromString('transfer'),
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
): UpdateContractPayload {
    return {
        amount: CcdAmount.fromMicroCcd(0n),
        address: ContractAddress.create(index, subindex),
        receiveName: ReceiveName.fromString(`${contractName}.transfer`),
        message: serializeTokenTransferParameters(parameters),
        maxContractExecutionEnergy: Energy.create(maxContractExecutionEnergy),
    };
}

async function getTokenTransferExecutionEnergyEstimate(
    client: ConcordiumGRPCClient,
    parameter: Buffer,
    invoker: AccountAddress.Type,
    contractName: string,
    index: bigint,
    subindex = 0n
): Promise<bigint> {
    const contractAddress = ContractAddress.create(index, subindex);
    const res = await client.invokeContract({
        contract: contractAddress,
        invoker,
        parameter: Parameter.fromBuffer(parameter),
        method: ReceiveName.fromString(`${contractName}.transfer`),
    });
    if (!res || res.tag === 'failure') {
        throw new Error(res?.reason?.tag || 'no response');
    }

    return applyExecutionNRGBuffer(res.usedEnergy.value);
}

function getContractName(instanceInfo: InstanceInfo): string | undefined {
    return instanceInfo.name.value.substring(5);
}

export async function fetchContractName(client: ConcordiumGRPCClient, index: bigint, subindex = 0n) {
    const instanceInfo = await client.getInstanceInfo(ContractAddress.create(index, subindex));
    if (!instanceInfo) {
        return undefined;
    }
    return getContractName(instanceInfo);
}

export async function getTokenTransferEnergy(
    client: ConcordiumGRPCClient,
    address: string,
    recipient: string,
    tokenId: string,
    amount: bigint,
    contractIndex: bigint
) {
    const parameters = getTokenTransferParameters(address, recipient, tokenId, amount);
    const serializedParameters = serializeTokenTransferParameters(parameters);
    const contractName = (await fetchContractName(client, contractIndex)) || '';
    const execution = await getTokenTransferExecutionEnergyEstimate(
        client,
        Buffer.from(Parameter.toBuffer(serializedParameters)),
        AccountAddress.fromBase58(address),
        contractName,
        contractIndex
    );
    const total = calculateEnergyCost(
        1n,
        determineUpdatePayloadSize(serializedParameters.buffer.length, `${contractName}.transfer`),
        execution
    );
    return { execution, total };
}

type TokenData = {
    id: string;
    metadataLink: string;
    metadata: TokenMetadata | undefined;
    balance: bigint;
    error: string;
};

type GetTokensResult = TokenData[];

export async function getTokens(
    contractDetails: ContractDetails,
    client: ConcordiumGRPCClient,
    account: string,
    ids: string[],
    onError?: (error: string) => void
): Promise<GetTokensResult> {
    const contract = new CIS2Contract(
        client,
        ContractAddress.create(contractDetails.index, contractDetails.subindex),
        ContractName.fromString(contractDetails.contractName)
    );
    const tokenData: (TokenData | undefined)[] = await Promise.all(
        ids.map(async (id, index) => {
            const internalData: TokenData = { id, metadataLink: '', metadata: {}, balance: 0n, error: '' };
            let metadataUrl;
            try {
                metadataUrl = await contract.tokenMetadata(id);
                internalData.metadataLink = metadataUrl.url;
            } catch (e) {
                const errorMessage = `id: "${id}: Failed to get metadata url`;
                internalData.error = errorMessage;
                onError?.(errorMessage);
                return internalData;
            }

            let metadata;
            try {
                metadata = await getTokenMetadata(metadataUrl);
                internalData.metadata = metadata || {};
            } catch (e) {
                const errorMessage = `id: "${ids[index]}": ${(e as Error).message}`;
                internalData.error = errorMessage;
                onError?.(errorMessage);
                return internalData;
            }

            let balance: bigint;
            try {
                balance =
                    (await contract.balanceOf({ address: AccountAddress.fromBase58(account), tokenId: id })) || 0n;
                internalData.balance = balance;
            } catch (e) {
                const errorMessage = `id: "${ids[index]}": Failed to get token balance`;
                internalData.error = errorMessage;
                onError?.(errorMessage);
                return internalData;
            }

            return internalData;
        })
    );

    return tokenData.filter((data): data is TokenData => Boolean(data));
}

const MAX_SYMBOL_LENGTH = 10;

export const trunctateSymbol = (symbol: string): string =>
    symbol.length > MAX_SYMBOL_LENGTH ? `${symbol.substring(0, MAX_SYMBOL_LENGTH)}...` : symbol;

export const ownsOne = (balance: bigint, decimals: number) => balance === BigInt(10 ** decimals);
