/* eslint-disable @typescript-eslint/no-unused-vars */
import { Atom, atom } from 'jotai';
import { mapRecordValues } from 'wallet-common-helpers/src/utils/basicHelpers';
import { atomFamily } from 'jotai/utils';
import { ChromeStorageKey, TokenIdAndMetadata, TokenMetadata, TokenStorage } from '@shared/storage/types';
import { ContractBalances, getContractBalances } from '@shared/utils/token-helpers';
import { JsonRpcClient } from '@concordium/web-sdk';
import { loop } from '@shared/utils/function-helpers';
import { AsyncWrapper, atomWithChromeStorage } from './utils';
import { jsonRpcClientAtom } from './settings';
import { selectedAccountAtom } from './account';

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

const accountTokensFamily = atomFamily<string, Atom<AsyncWrapper<Record<string, TokenIdAndMetadata[]>>>>(
    (accountAddress) =>
        atom((get) => {
            const tokens = get(tokensAtom);
            if (tokens.loading) {
                return { loading: true, value: {} };
            }
            return { loading: false, value: tokens.value[accountAddress] };
        })
);

export const currentAccountTokensAtom = atom<
    AsyncWrapper<Record<string, TokenIdAndMetadata[]>>,
    { contractIndex: string; newTokens: TokenIdAndMetadata[] },
    Promise<void>
>(
    (get) => {
        const currentAccount = get(selectedAccountAtom);
        if (!currentAccount) {
            return { loading: true, value: {} };
        }
        return get(accountTokensFamily(currentAccount));
    },
    async (get, set, { contractIndex, newTokens }) => {
        const tokens = get(storedTokensAtom);
        const tokenMetadata = get(tokenMetadataAtom);
        if (tokens.loading || tokenMetadata.loading) {
            throw new Error('Unable to update tokens while they are loading');
        }
        const currentAccount = get(selectedAccountAtom);
        if (!currentAccount) {
            throw new Error('Unable to update tokens for an account if there is no chosen account');
        }
        const accountCollections: Record<string, TokenStorage[]> = tokens.value[currentAccount] || {};
        accountCollections[contractIndex] = newTokens.map((token) => ({
            id: token.id,
            metadataLink: token.metadataLink,
        }));
        const updatedTokens = { ...tokens.value };
        updatedTokens[currentAccount] = accountCollections;
        const newMetadata = tokenMetadata.value;
        newTokens.forEach((token) => {
            newMetadata[token.metadataLink] = token.metadata;
        });
        await set(tokenMetadataAtom, newMetadata);
        return set(storedTokensAtom, updatedTokens);
    }
);

const BALANCES_UPDATE_INTERVAL = 1000 * 60; // 1 minute

const cbf = atomFamily<string, Atom<ContractBalances>>((identifier: string) => {
    const parts = identifier.split('.');

    if ((parts as (string | undefined)[]).includes(undefined)) {
        throw new Error('Could not get token balance family due to invalid input');
    }

    const [accountAddress, contractIndex] = parts;

    const baseAtom = atom<ContractBalances>({});

    const derivedAtom = atom<ContractBalances, void, Promise<void>>(
        (get) => get(baseAtom),
        async (get, set) => {
            const client = get(jsonRpcClientAtom);
            const tokens = get(accountTokensFamily(accountAddress));

            const tokenIds = tokens.value[contractIndex]?.map((t) => t.id) ?? [];

            if (tokenIds.length !== 0) {
                const balances = await getContractBalances(client, contractIndex, tokenIds, accountAddress);
                set(baseAtom, balances);
            }
        }
    );

    derivedAtom.onMount = (setValue) => {
        setValue();
        const i = setInterval(setValue, BALANCES_UPDATE_INTERVAL);

        return () => clearInterval(i);
    };

    return derivedAtom;
});

export const contractBalancesFamily = (accountAddress: string, contractIndex: string) =>
    cbf(`${accountAddress}.${contractIndex}`);
