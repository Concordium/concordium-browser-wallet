import { AccountAddress, CIS2, ContractAddress } from '@concordium/web-sdk';
import { accountTokensFamily } from '@popup/store/token';
import { TokenMetadata } from '@shared/storage/types';
import { useAtomValue } from 'jotai';

export type Cis2TokenInfo = CIS2.TokenAddress & {
    tokenType: 'cis2';
    /** The token metadata corresponding to the {@linkcode CIS2.TokenAddress} */
    metadata: TokenMetadata;
};

export type PltTokenInfo = { id: string; tokenType: 'plt'; metadata: TokenMetadata };

/** Token info in the format expected by the `TokenAmount` component */
export type TokenInfo = Cis2TokenInfo | PltTokenInfo;

type TokenInfoResponse = { loading: true } | { loading: false; value: TokenInfo[] };

/**
 * Custom hook to fetch token information for a given account. This matches the format expected by the `TokenAmount` component
 *
 * @param {AccountAddress.Type} account - The account address for which to fetch token information.
 * @returns {TokenInfoResponse} - An object containing a loading state and an array of token information.
 */
export function useTokenInfo(account: AccountAddress.Type): TokenInfoResponse {
    const { value, loading } = useAtomValue(accountTokensFamily(account.address));

    if (loading === true) {
        return { loading: true };
    }

    const mapped = Object.entries(value)
        .flatMap(([index, tokens]) =>
            tokens.map((t): TokenInfo => {
                if (Number(index) >= 0) {
                    return {
                        contract: ContractAddress.create(BigInt(index)),
                        id: t.id,
                        tokenType: 'cis2',
                        metadata: t.metadata,
                    } as Cis2TokenInfo;
                }

                return {
                    id: t.id,
                    tokenType: 'plt',
                    metadata: t.metadata,
                } as PltTokenInfo;
            })
        )
        .sort((a, b) => (b.metadata.addedAt || 0) - (a.metadata.addedAt || 0));

    return { loading: false, value: mapped };
}
