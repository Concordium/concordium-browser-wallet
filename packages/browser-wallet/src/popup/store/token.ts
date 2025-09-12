/* eslint-disable @typescript-eslint/no-unused-vars */
import { Atom, atom, WritableAtom } from 'jotai';
import { mapRecordValues } from 'wallet-common-helpers';
import { atomFamily } from 'jotai/utils';
import { ChromeStorageKey, TokenIdAndMetadata, TokenMetadata, TokenStorage } from '@shared/storage/types';
import { ContractBalances, getContractBalances, mapPltToLoadedToken } from '@shared/utils/token-helpers';
import { addToastAtom } from '@popup/state';
import { AccountInfo, ContractAddress } from '@concordium/web-sdk';
import { getContractName } from '@shared/utils/contract-helpers';
import { PLT } from '@shared/constants/token';
import { getPltToken } from '@popup/shared/utils/wallet-proxy';
import { accountInfoFamily } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { AsyncWrapper, atomWithChromeStorage } from './utils';
import { grpcClientAtom } from './settings';
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

export type AccountTokens = Record<string, TokenIdAndMetadata[]>;
export type Tokens = Record<string, AccountTokens>;
export const tokensAtom = atom<AsyncWrapper<Tokens>>((get) => {
    const tokens = get(storedTokensAtom);
    const tokenMetadata = get(tokenMetadataAtom);

    if (tokens.loading || tokenMetadata.loading) {
        return { loading: true, value: {} as Tokens };
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

export const accountTokensFamily = atomFamily<
    string,
    WritableAtom<AsyncWrapper<AccountTokens>, { contractIndex: string; newTokens: TokenIdAndMetadata[] }, Promise<void>>
>((accountAddress) =>
    atom(
        (get) => {
            const tokens = get(tokensAtom);
            if (tokens.loading) {
                return { loading: true, value: {} };
            }
            return { loading: false, value: tokens.value[accountAddress] || {} };
        },
        async (get, set, { contractIndex, newTokens }) => {
            const tokens = get(storedTokensAtom);
            const tokenMetadata = get(tokenMetadataAtom);
            if (tokens.loading || tokenMetadata.loading) {
                throw new Error('Unable to update tokens while they are loading');
            }
            const accountCollections: Record<string, TokenStorage[]> = tokens.value[accountAddress] || {};
            accountCollections[contractIndex] = newTokens.map((token) => ({
                id: token.id,
                metadataLink: token.metadataLink,
            }));
            const updatedTokens = { ...tokens.value };
            updatedTokens[accountAddress] = accountCollections;
            const newMetadata = tokenMetadata.value;
            newTokens.forEach((token) => {
                newMetadata[token.metadataLink] = token.metadata;
            });
            await set(tokenMetadataAtom, newMetadata);
            return set(storedTokensAtom, updatedTokens);
        }
    )
);

export const currentAccountTokensAtom = atom<
    AsyncWrapper<AccountTokens>,
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
    async (get, set, update) => {
        const currentAccount = get(selectedAccountAtom);
        if (!currentAccount) {
            throw new Error('Unable to update tokens for an account if there is no chosen account');
        }
        return set(accountTokensFamily(currentAccount), update);
    }
);

export const hidePltInRemove = (tokens: TokenIdAndMetadata[], tokenId: string) =>
    tokens?.reduce((acc, t) => {
        if (t.id === tokenId) {
            return [...acc, { ...t, metadata: { ...t.metadata, isHidden: true } }];
        }
        return [...acc, t];
    }, [] as TokenIdAndMetadata[]);

export const removeTokenFromCurrentAccountAtom = atom<null, { contractIndex: string; tokenId: string }>(
    null,
    (get, set, { contractIndex, tokenId }) => {
        const { loading, value } = get(currentAccountTokensAtom);
        const tokens = value[contractIndex];

        if (loading || tokens === undefined) {
            throw new Error('Unable to update tokens');
        }

        const newTokens =
            contractIndex === PLT ? hidePltInRemove(tokens, tokenId) : tokens?.filter((t) => t.id !== tokenId);

        set(currentAccountTokensAtom, { contractIndex, newTokens });
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
            const client = get(grpcClientAtom);
            const tokens = get(accountTokensFamily(accountAddress));
            const tokenIds = tokens.value[contractIndex]?.map((t) => t.id) ?? [];

            if (tokenIds.length === 0) return;

            if (contractIndex !== PLT) {
                const instanceInfo = await client.getInstanceInfo(ContractAddress.create(BigInt(contractIndex)));

                let balances = {};
                if (instanceInfo !== undefined) {
                    balances = await getContractBalances(
                        client,
                        {
                            index: BigInt(contractIndex),
                            subindex: 0n,
                            contractName: getContractName(instanceInfo),
                        },
                        tokenIds,
                        accountAddress,
                        (error) => set(addToastAtom, error)
                    );
                }
                set(baseAtom, balances);
            } else {
                const accountInfo = get(accountInfoFamily(accountAddress));
                const balances = accountInfo?.accountTokens.reduce(
                    (acc, t) => ({ ...acc, [t.id.toString()]: t.state.balance.value }),
                    {}
                );
                if (balances) {
                    set(baseAtom, balances);
                }
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

export const autoAddPltToAccount = (accountInfo: AccountInfo | undefined) => {
    const tokenListWriteAtom = atom(null, async (get, set) => {
        if (accountInfo) {
            const {
                accountTokens,
                accountAddress: { address },
            } = accountInfo;

            const tokens = get(accountTokensFamily(address));

            if (tokens.loading) {
                throw new Error('Loading tokens, waiting for update');
            }

            const pltTokens = tokens.value[PLT] || [];
            const pltTokensIds = pltTokens.map((t) => t.id);
            const tokensToAdd = [] as TokenIdAndMetadata[];

            const processPlt = async (accountTokenId: string) => {
                const isAdded = pltTokensIds.includes(accountTokenId);
                if (isAdded) return;

                const pltData = await getPltToken(accountTokenId);
                if (!pltData) return;

                const { id, metadata, metadataLink } = await mapPltToLoadedToken(pltData, accountInfo, tokens);
                tokensToAdd.push({ id, metadata, metadataLink });
            };

            for (const { id } of accountTokens) {
                await processPlt(id.toString());
            }

            if (tokensToAdd.length > 0) {
                set(currentAccountTokensAtom, { contractIndex: PLT, newTokens: [...pltTokens, ...tokensToAdd] });
            }
        }
    });

    tokenListWriteAtom.onMount = (setValue) => {
        setValue();
        const i = setInterval(setValue, BALANCES_UPDATE_INTERVAL);

        return () => clearInterval(i);
    };

    return tokenListWriteAtom;
};
