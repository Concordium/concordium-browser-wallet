import { ConcordiumGRPCClient } from '@concordium/web-sdk';
import { getCis2Tokens } from '@popup/shared/utils/wallet-proxy';
import { TokenIdAndMetadata } from '@shared/storage/types';
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
    details: 'details',
};

export const fetchTokensConfigure =
    (
        contractDetails: ContractDetails,
        client: ConcordiumGRPCClient,
        account: string,
        onError?: (error: string) => void
    ) =>
    async (initialFrom?: number): Promise<FetchTokensResponse> => {
        let tokens: TokenWithPageID[] = [];
        let hasMore = true;
        let from = initialFrom;
        while (tokens.length === 0 && hasMore) {
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

            hasMore = count === limit;
            from = cts[cts.length - 1]?.id;

            const tokenData = await getTokens(
                contractDetails,
                client,
                account,
                cts.map((t) => t.token),
                onError
            );

            tokens = tokenData.map((t, i) => ({
                ...t,
                pageId: cts[i].id,
            }));
        }

        return {
            hasMore,
            tokens,
        };
    };
