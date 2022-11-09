import { JsonRpcClient } from '@concordium/web-sdk';
import { getCis2Tokens } from '@popup/shared/utils/wallet-proxy';
import { NetworkConfiguration, TokenIdAndMetadata } from '@shared/storage/types';
import { ContractDetails, ContractTokenDetails, getTokens } from '@shared/utils/token-helpers';
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

export const manageTokensRoutes = {
    update: 'update',
    details: 'details',
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
