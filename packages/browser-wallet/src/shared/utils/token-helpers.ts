import { Buffer } from 'buffer/';
import uleb128 from 'leb128/unsigned';
import {
    AccountAddress,
    GtuAmount,
    InstanceInfo,
    JsonRpcClient,
    serializeUpdateContractParameters,
} from '@concordium/web-sdk';
import { TokenMetadata } from '@shared/storage/types';
import { CIS2_SCHEMA_CONTRACT_NAME, CIS2_SCHEMA } from '@popup/constants/schema';
// TODO: Replace dependency
import * as leb from '@thi.ng/leb128';
import { getCcdSymbol } from 'wallet-common-helpers';
import { SmartContractParameters } from './types';

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

/**
 * Confirms that the given smart contract instance is CIS-2 compliant
 */
export async function confirmCIS2Contract(
    client: JsonRpcClient,
    { contractName, index, subindex }: ContractDetails
): Promise<string | undefined> {
    const supports = await client.invokeContract({
        contract: { index, subindex },
        method: `${contractName}.supports`,
        parameter: getCIS2Identifier(),
    });
    if (!supports || supports.tag === 'failure') {
        return 'Chosen contract does not support CIS-0';
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

export type TokenIdentifier = { contractIndex: string; tokenId: string; metadata: TokenMetadata };

// TODO move to constants or find another solution.
export const CCD_METADATA: TokenMetadata = {
    name: 'CCD',
    decimals: 6,
    symbol: getCcdSymbol(),
    display: {
        url: "data:image/svg+xml;charset=UTF-8,%3csvg viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M23.8461 17.8447H19.3916C20.5119 16.3777 21.2054 14.5372 21.2054 12.5366C21.2054 10.5361 20.5119 8.69558 19.3916 7.22852H23.8461C24.593 8.85562 25.0198 10.6428 25.0198 12.5366C25.0198 14.4305 24.6197 16.2176 23.8461 17.8447Z' fill='%23181817' /%3e%3cpath d='M12.5103 17.8184C15.4418 17.8184 17.8184 15.4418 17.8184 12.5103C17.8184 9.57867 15.4418 7.20215 12.5103 7.20215C9.57867 7.20215 7.20215 9.57867 7.20215 12.5103C7.20215 15.4418 9.57867 17.8184 12.5103 17.8184Z' fill='%23181817' /%3e%3cpath d='M3.81437 12.5367C3.81437 17.338 7.70876 21.2591 12.5101 21.2591C13.7904 21.2591 15.0174 20.9657 16.111 20.4589V24.54C14.9641 24.8868 13.7637 25.0735 12.5101 25.0735C5.60152 25.0735 0 19.4453 0 12.5367C0 5.60152 5.60152 0 12.5101 0C13.7637 0 14.9641 0.186717 16.111 0.533478V4.61459C15.0174 4.10778 13.7904 3.81437 12.5101 3.81437C7.70876 3.81437 3.81437 7.70876 3.81437 12.5367Z' fill='%23181817' /%3e%3c/svg%3e",
    },
};

export async function getTokenBalance(client: JsonRpcClient, account: string, token: TokenIdentifier) {
    const parameters = [
        {
            address: { Account: [account] },
            token_id: token.tokenId,
        },
    ];

    const parameter = serializeUpdateContractParameters(
        CIS2_SCHEMA_CONTRACT_NAME,
        'balanceOf',
        parameters,
        Buffer.from(CIS2_SCHEMA, 'base64'),
        1
    );

    const contractAddress = { index: BigInt(token.contractIndex), subindex: 0n };
    const instanceInfo = await client.getInstanceInfo(contractAddress);
    if (!instanceInfo) {
        throw new Error(`Unable to get info on contract`);
    }
    const contractName = instanceInfo.name.substring(5);
    const res = await client.invokeContract({
        contract: contractAddress,
        parameter,
        method: `${contractName}.balanceOf`,
    });
    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(`Expected succesful invocation`);
    }
    return BigInt(leb.decodeULEB128(Buffer.from(res.returnValue.substring(4), 'hex'))[0]);
}

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
