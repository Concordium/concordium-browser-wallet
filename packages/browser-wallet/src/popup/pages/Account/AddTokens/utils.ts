import { JsonRpcClient } from '@concordium/web-sdk';
import { getCis2Tokens } from '@popup/shared/utils/wallet-proxy';
import { NetworkConfiguration, TokenIdAndMetadata, TokenMetadata } from '@shared/storage/types';
import { ContractDetails, getContractBalances, getTokenMetadata, getTokenUrl } from '@shared/utils/token-helpers';
import { MakeOptional } from 'wallet-common-helpers';

export type ContractTokenDetails = TokenIdAndMetadata & {
    balance: bigint;
};

export const TOKENS_PAGE_SIZE = 20;

type TokenWithPageID = MakeOptional<ContractTokenDetails, 'metadata'> & {
    pageId: number;
};

const fallbackMetadata = (id: string): TokenMetadata => ({
    thumbnail: { url: 'https://picsum.photos/40/40' },
    display: { url: 'https://picsum.photos/200/300' },
    name: id.substring(0, 8),
    decimals: 0,
    description: id,
    unique: true,
});

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
            metadataUrls.map((url, i) => {
                const fallback = fallbackMetadata(ids[i]); // TODO change to undefined, only here for testing purposes.
                return getTokenMetadata(url, network).catch(() => Promise.resolve(fallback));
            })
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
    async (from?: number): Promise<TokenWithPageID[]> => {
        const cts =
            (await getCis2Tokens(contractDetails.index, contractDetails.subindex, from, TOKENS_PAGE_SIZE))?.tokens ??
            [];

        const tokens = await getTokens(
            contractDetails,
            client,
            network,
            account,
            cts.map((t) => t.token)
        );

        return tokens.map((t, i) => ({
            ...t,
            pageId: cts[i].id,
        }));
    };
