import { CIS2 } from '@concordium/common-sdk';
import { AccountAddress, ContractAddress } from '@concordium/web-sdk';
import { TokenPickerVariant } from '@popup/popupX/shared/Form/TokenAmount/View';
import { useTokenInfo } from '@popup/popupX/shared/Form/TokenAmount/util';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import { TokenMetadata } from '@shared/storage/types';

/**
 * React hook to retrieve the metadata for a specific token associated with a given account.
 *
 * @param {TokenPickerVariant} [token] - The token for which metadata is to be retrieved.
 * @param {AccountAddress.Type} account - The account address to fetch token information for.
 * @returns {TokenMetadata | undefined} - The metadata of the token if found, otherwise undefined.
 */
export function useTokenMetadata(
    token: TokenPickerVariant | undefined,
    account: AccountAddress.Type
): TokenMetadata | undefined {
    const tokens = useTokenInfo(account);
    if (tokens.loading || token?.tokenType === undefined) return undefined;

    if (token.tokenType === 'ccd') return CCD_METADATA;

    if (token.tokenType === 'plt') {
        return undefined;
    }

    return tokens.value.find(
        (t) => t.id === token.tokenAddress.id && ContractAddress.equals(token.tokenAddress.contract, t.contract)
    )?.metadata;
}

/**
 * Formats the display name of a token using its metadata and address.
 *
 * @param {TokenMetadata} metadata - The metadata of the token.
 * @param {CIS2.TokenAddress} tokenAddress - The address of the token.
 * @returns {string} - The formatted display name of the token.
 */
export function showToken(metadata: TokenMetadata, tokenAddress: CIS2.TokenAddress): string {
    return metadata.symbol ?? metadata.name ?? `${tokenAddress.id}@${tokenAddress.contract.toString()}`;
}

export const CIS2_TRANSFER_NRG_OFFSET = 100n;
