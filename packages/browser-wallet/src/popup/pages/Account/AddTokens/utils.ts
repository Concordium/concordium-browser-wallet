import { JsonRpcClient } from '@concordium/web-sdk';
import { getCis2Tokens } from '@popup/shared/utils/wallet-proxy';
import { NetworkConfiguration, TokenIdAndMetadata, TokenMetadata } from '@shared/storage/types';
import {
    ContractDetails,
    ContractTokenDetails,
    getContractBalances,
    getTokenMetadata,
    getTokenUrl,
} from '@shared/utils/token-helpers';
import { MakeOptional } from 'wallet-common-helpers';

export const TOKENS_PAGE_SIZE = 20;

type TokenWithPageID = MakeOptional<ContractTokenDetails, 'metadata'> & {
    pageId: number;
};

export type FetchTokensResponse = {
    hasMore: boolean;
    tokens: TokenWithPageID[];
};

export type DetailsLocationState = {
    contractIndex: bigint;
    token: TokenIdAndMetadata;
    balance: bigint;
};

export const addTokensRoutes = {
    update: 'update',
    details: 'details',
};

export const getTokens = async (
    contractDetails: ContractDetails,
    client: JsonRpcClient,
    network: NetworkConfiguration,
    account: string,
    ids: string[]
) => {
    const metadataPromise: Promise<[string[], Array<TokenMetadata | undefined>]> = (async () => {
        const metadataUrls = await getTokenUrl(client, ids, contractDetails);
        const metadata = await Promise.all(
            metadataUrls.map((url) => getTokenMetadata(url, network).catch(() => Promise.resolve(undefined)))
        );
        return [metadataUrls, metadata];
    })();

    const balancesPromise = getContractBalances(client, contractDetails.index, contractDetails.subindex, ids, account);

    const [[metadataUrls, metadata], balances] = await Promise.all([metadataPromise, balancesPromise]); // Run in parallel.

    return ids.map((id, i) => ({
        id,
        metadataLink: metadataUrls[i],
        metadata: metadata[i],
        balance: balances[id] ?? 0n,
    }));
};

export const fetchTokensConfigure =
    (contractDetails: ContractDetails, client: JsonRpcClient, network: NetworkConfiguration, account: string) =>
    async (from?: number): Promise<FetchTokensResponse> => {
        const {
            tokens: cts,
            count,
            limit,
        } = (await getCis2Tokens(contractDetails.index, contractDetails.subindex, from, TOKENS_PAGE_SIZE)) ?? {
            tokens: [],
            count: 0,
            limit: TOKENS_PAGE_SIZE,
            from,
        };

        const tokens = await getTokens(
            contractDetails,
            client,
            network,
            account,
            cts.map((t) => t.token)
        );

        return {
            hasMore: count === limit,
            tokens: tokens.map((t, i) => ({
                ...t,
                pageId: cts[i].id,
            })),
        };
    };
