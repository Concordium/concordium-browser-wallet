import { AccountAddress, CIS2, ContractAddress } from '@concordium/web-sdk';
import { accountTokensFamily } from '@popup/store/token';
import { TokenMetadata } from '@shared/storage/types';
import { useAtomValue } from 'jotai';

/** Token info in the format expected by the `TokenAmount` component */
export type TokenInfo = CIS2.TokenAddress & {
    /** The token metadata corresponding to the {@linkcode CIS2.TokenAddress} */
    metadata: TokenMetadata;
};

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

    const mapped = Object.entries(value).flatMap(([index, tokens]) =>
        Number(index) >= 0
            ? tokens.map(
                  (t): TokenInfo => ({
                      contract: ContractAddress.create(BigInt(index)),
                      id: t.id,
                      metadata: t.metadata,
                  })
              )
            : []
    );

    return { loading: false, value: mapped };
}
