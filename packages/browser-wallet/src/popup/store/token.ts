/* eslint-disable @typescript-eslint/no-unused-vars */
import { Atom, atom } from 'jotai';
import { mapRecordValues } from 'wallet-common-helpers/src/utils/basicHelpers';
import { atomFamily } from 'jotai/utils';
import { ChromeStorageKey, TokenIdAndMetadata, TokenMetadata, TokenStorage } from '@shared/storage/types';
import { JsonRpcClient } from '@concordium/web-sdk';
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

const getBalance = async (
    client: JsonRpcClient,
    contractIndex: string,
    tokenIndex: string,
    accountAddress: string
): Promise<bigint> => {
    // eslint-disable-next-line no-console
    console.log('get balance');
    return 12350000014n;
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
