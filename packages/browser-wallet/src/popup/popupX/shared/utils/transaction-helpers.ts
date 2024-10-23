import {
    AccountAddress,
    AccountInfo,
    AccountInfoType,
    AccountTransactionType,
    BakerPoolStatusDetails,
    ChainParameters,
    ChainParametersV0,
    ConfigureDelegationPayload,
    convertEnergyToMicroCcd,
    getEnergyCost,
} from '@concordium/web-sdk';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import i18n from '@popup/shell/i18n';
import { useCallback } from 'react';
import {
    ccdToMicroCcd,
    displayAsCcd,
    fractionalToInteger,
    getPublicAccountAmounts,
    isValidCcdString,
    isValidResolutionString,
} from 'wallet-common-helpers';

/**
 * Validates if the chosen transfer amount can be sent with the current balance at disposal.
 * @param decimals how many decimals can the transfer amount. This is used to convert it from a fractional string to an integer.
 * @param estimatedFee additional costs for the transfer.
 */
export function validateTransferAmount(
    transferAmount: string,
    atDisposal: bigint | undefined,
    decimals = 0,
    estimatedFee = 0n
): string | undefined {
    if (!isValidResolutionString(10n ** BigInt(decimals), false, false, false)(transferAmount)) {
        return i18n.t('x:sharedX.utils.amount.invalid');
    }
    const amountToValidateInteger = fractionalToInteger(transferAmount, decimals);
    if (atDisposal !== undefined && atDisposal < amountToValidateInteger + estimatedFee) {
        return i18n.t('x:sharedX.utils.amount.insufficient');
    }
    if (amountToValidateInteger === 0n) {
        return i18n.t('x:sharedX.utils.amount.zero');
    }
    return undefined;
}

export function validateBakerStake(
    amountToValidate: string,
    chainParameters?: Exclude<ChainParameters, ChainParametersV0>,
    accountInfo?: AccountInfo,
    estimatedFee = 0n
): string | undefined {
    if (!isValidCcdString(amountToValidate)) {
        return i18n.t('x:sharedX.utils.amount.invalid');
    }
    const bakerStakeThreshold = chainParameters?.minimumEquityCapital.microCcdAmount || 0n;
    const amount = ccdToMicroCcd(amountToValidate);

    const amountChanged =
        accountInfo?.type !== AccountInfoType.Baker || amount !== accountInfo.accountBaker.stakedAmount.microCcdAmount;

    if (amountChanged && bakerStakeThreshold > amount) {
        return i18n.t('x:sharedX.utils.amount.belowBakerThreshold', {
            threshold: displayAsCcd(bakerStakeThreshold, false),
        });
    }

    if (
        accountInfo &&
        (BigInt(accountInfo.accountAmount.microCcdAmount) < amount + estimatedFee ||
            // the fee must be paid with the current funds at disposal, because a reduction in delegation amount is not immediate.
            getPublicAccountAmounts(accountInfo).atDisposal < estimatedFee)
    ) {
        return i18n.t('x:sharedX.utils.amount.insufficient');
    }

    return undefined;
}

export function validateAccountAddress(cand: string): string | undefined {
    try {
        // eslint-disable-next-line no-new
        AccountAddress.fromBase58(cand);
        return undefined;
    } catch {
        return i18n.t('x:sharedX.utils.address.invalid');
    }
}

export function validateDelegationAmount(
    delegatedAmount: string,
    accountInfo: AccountInfo,
    estimatedFee: bigint,
    targetStatus?: BakerPoolStatusDetails
): string | undefined {
    if (!isValidCcdString(delegatedAmount)) {
        return i18n.t('x:sharedX.utils.amount.invalid');
    }

    const amount = ccdToMicroCcd(delegatedAmount);

    if (amount === 0n) {
        return i18n.t('x:sharedX.utils.amount.zero');
    }

    const max =
        targetStatus && targetStatus.delegatedCapitalCap && targetStatus.delegatedCapital
            ? targetStatus.delegatedCapitalCap.microCcdAmount - targetStatus.delegatedCapital.microCcdAmount
            : undefined;
    if (max !== undefined && amount > max) {
        return i18n.t('x:sharedX.utils.amount.exceedingDelegationCap', { max: displayAsCcd(max) });
    }

    if (
        BigInt(accountInfo.accountAmount.microCcdAmount) < amount + estimatedFee ||
        // the fee must be paid with the current funds at disposal, because a reduction in delegation amount is not immediate.
        getPublicAccountAmounts(accountInfo).atDisposal < estimatedFee
    ) {
        return i18n.t('x:sharedX.utils.amount.insufficient');
    }

    return undefined;
}

/** Hook which exposes a function for getting the transaction fee for a given transaction type */
export function useGetTransactionFee(type: AccountTransactionType) {
    const cp = useBlockChainParameters();

    return useCallback(
        (payload: ConfigureDelegationPayload) => {
            if (cp === undefined) {
                return undefined;
            }
            const energy = getEnergyCost(type, payload);
            return convertEnergyToMicroCcd(energy, cp);
        },
        [cp, type]
    );
}
