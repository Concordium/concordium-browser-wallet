import { CIS2 } from '@concordium/common-sdk';
import { AccountAddress, ContractAddress } from '@concordium/web-sdk';
import { TokenModuleState } from '@concordium/web-sdk/plt';
import { TokenPickerVariant } from '@popup/popupX/shared/Form/TokenAmount/View';
import { useTokenInfo } from '@popup/popupX/shared/Form/TokenAmount/util';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import { TokenMetadata } from '@shared/storage/types';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { cborDecode } from '@popup/popupX/shared/utils/helpers';

/**
 * React hook to retrieve the metadata for a specific token associated with a given account.
 *
 * @param {TokenPickerVariant} [token] - The token for which metadata is to be retrieved.
 * @param {AccountAddress.Type} account - The account address to fetch token information for.
 * @returns {TokenMetadataModule) | undefined} - The metadata and decoded moduleState of the token if found, otherwise undefined.
 */

type TokenMetadataModule = TokenMetadata & { moduleState?: TokenModuleState };

export function useTokenMetadata(
    token: TokenPickerVariant | undefined,
    account: AccountAddress.Type
): TokenMetadataModule | undefined {
    const tokens = useTokenInfo(account);
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');
    if (tokens.loading || token?.tokenType === undefined) return undefined;

    if (token.tokenType === 'ccd') return CCD_METADATA;

    if (token.tokenType === 'plt') {
        const state = accountInfo.accountTokens.find(({ id }) => id.toString() === token.tokenSymbol)?.state;
        const decimals = state?.balance.decimals;
        const moduleState = (state?.moduleState ? cborDecode(state?.moduleState.toString()) : {}) as TokenModuleState;
        return { decimals, moduleState };
    }

    return tokens.value.find(
        (t) =>
            t.tokenType === 'cis2' &&
            t.id === token.tokenAddress.id &&
            ContractAddress.equals(token.tokenAddress.contract, t.contract)
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
