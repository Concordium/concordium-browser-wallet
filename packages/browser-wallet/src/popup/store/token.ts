/* eslint-disable @typescript-eslint/no-unused-vars */
import { Atom, atom } from 'jotai';
import { mapRecordValues } from 'wallet-common-helpers/src/utils/basicHelpers';
import { atomFamily } from 'jotai/utils';
import { Buffer } from 'buffer/';
import { AccountAddress, JsonRpcClient } from '@concordium/web-sdk';
import uleb128 from 'leb128/unsigned';
import { ChromeStorageKey, TokenIdAndMetadata, TokenMetadata, TokenStorage } from '@shared/storage/types';
import { AsyncWrapper, atomWithChromeStorage } from './utils';
import { jsonRpcClientAtom } from './settings';

export const storedTokensAtom = atomWithChromeStorage<Record<string, Record<string, TokenStorage[]>>>(
    ChromeStorageKey.Tokens,
    {},
    true
);
export const tokenMetadataAtom = atomWithChromeStorage<Record<string, TokenMetadata>>(
    ChromeStorageKey.TokenMetadata,
    {},
    true
);

export const tokensAtom = atom<AsyncWrapper<Record<string, Record<string, TokenIdAndMetadata[]>>>>((get) => {
    const tokens = get(storedTokensAtom);
    const tokenMetadata = get(tokenMetadataAtom);
    if (tokens.loading || tokenMetadata.loading) {
        return { loading: true, value: {} as Record<string, Record<string, TokenIdAndMetadata[]>> };
    }
    return {
        loading: false,
        value: mapRecordValues(tokens.value, (accountTokens) =>
            mapRecordValues(accountTokens, (collectionTokens) =>
                collectionTokens.map((token) => {
                    return {
                        ...token,
                        metadata: tokenMetadata.value[token.metadataLink],
                    };
                })
            )
        ),
    };
});

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

const getBalance = async (
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

const tbf = atomFamily<string, Atom<Promise<bigint>>>((tokenId: string) => {
    const parts = tokenId.split('.');

    if ((parts as (string | undefined)[]).includes(undefined)) {
        throw new Error('Could not get token balance family due to invalid input');
    }

    const [accountAddress, contractIndex, tokenIndex] = parts;

    return atom<Promise<bigint>>((get) => {
        const client = get(jsonRpcClientAtom);
        return getBalance(client, contractIndex, tokenIndex, accountAddress);
    });
});

export const tokenBalanceFamily = (accountAddress: string, contractIndex: string, tokenIndex: string) =>
    tbf(`${accountAddress}.${contractIndex}.${tokenIndex}`);
