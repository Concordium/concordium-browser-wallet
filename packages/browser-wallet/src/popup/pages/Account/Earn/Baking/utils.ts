import {
    AccountInfo,
    CcdAmount,
    CommissionRates,
    isBakerAccountV1,
    OpenStatus,
    ConfigureBakerPayload,
    OpenStatusText,
    BakerKeysWithProofs,
} from '@concordium/web-sdk';
import { decimalToRewardFraction } from '@popup/shared/utils/baking-helpers';
import { getConfigureBakerEnergyCost } from '@shared/utils/energy-helpers';
import { not } from '@shared/utils/function-helpers';
import { ccdToMicroCcd, isDefined, isValidCcdString, microCcdToCcd, NotOptional } from 'wallet-common-helpers';

export type ConfigureBakerFlowState = {
    restake: boolean;
    /** In CCD */
    amount: string;
    openForDelegation: OpenStatus;
    metadataUrl: string;
    commissionRates: Partial<CommissionRates>;
    keys: BakerKeysWithProofs | null;
};

function openStatusFromText(status: OpenStatusText): OpenStatus {
    switch (status) {
        case OpenStatusText.ClosedForAll:
            return OpenStatus.ClosedForAll;
        case OpenStatusText.ClosedForNew:
            return OpenStatus.ClosedForNew;
        case OpenStatusText.OpenForAll:
            return OpenStatus.OpenForAll;
        default:
            throw new Error(`Unknown openStatus encountered: ${status}`);
    }
}

export const getExistingBakerValues = (accountInfo: AccountInfo): NotOptional<ConfigureBakerFlowState> | undefined => {
    if (!isBakerAccountV1(accountInfo)) {
        return undefined;
    }

    const { stakedAmount, restakeEarnings, bakerPoolInfo } = accountInfo.accountBaker;
    const { openStatus, metadataUrl, commissionRates } = bakerPoolInfo;

    return {
        keys: null,
        amount: microCcdToCcd(stakedAmount) ?? '0.00',
        restake: restakeEarnings,
        openForDelegation: openStatusFromText(openStatus),
        metadataUrl,
        commissionRates,
    };
};

export type ConfigureBakerFlowStateChanges = Partial<ConfigureBakerFlowState>;

export const getBakerFlowChanges = (
    existingValues: ConfigureBakerFlowState,
    newValues: ConfigureBakerFlowState
): ConfigureBakerFlowStateChanges => {
    const changes: ConfigureBakerFlowStateChanges = {};

    try {
        if (
            existingValues.amount === undefined ||
            newValues.amount === undefined ||
            ccdToMicroCcd(existingValues.amount) !== ccdToMicroCcd(newValues.amount)
        ) {
            changes.amount = newValues.amount;
        }
    } catch {
        // Nothing...
    }
    if (existingValues.restake !== newValues.restake) {
        changes.restake = newValues.restake;
    }
    if (existingValues.openForDelegation !== newValues.openForDelegation) {
        changes.openForDelegation = newValues.openForDelegation;
    }
    if (existingValues.commissionRates?.bakingCommission !== newValues.commissionRates?.bakingCommission) {
        changes.commissionRates = {
            bakingCommission: newValues.commissionRates.bakingCommission,
        };
    }
    if (existingValues.commissionRates?.transactionCommission !== newValues.commissionRates?.transactionCommission) {
        changes.commissionRates = {
            ...changes.commissionRates,
            transactionCommission: newValues.commissionRates.transactionCommission,
        };
    }
    if (existingValues.commissionRates?.finalizationCommission !== newValues.commissionRates?.finalizationCommission) {
        changes.commissionRates = {
            ...changes.commissionRates,
            finalizationCommission: newValues.commissionRates.finalizationCommission,
        };
    }
    if (existingValues.metadataUrl !== newValues.metadataUrl) {
        changes.metadataUrl = newValues.metadataUrl;
    }
    if (newValues.keys?.proofSig) {
        changes.keys = newValues.keys;
    }

    return changes;
};

export const toPayload = ({
    keys,
    amount,
    restake,
    openForDelegation,
    metadataUrl,
    commissionRates,
}: Partial<ConfigureBakerFlowState>): ConfigureBakerPayload => ({
    keys: keys || undefined,
    stake: amount ? new CcdAmount(ccdToMicroCcd(amount)) : undefined,
    restakeEarnings: restake,
    openForDelegation,
    metadataUrl,
    bakingRewardCommission: decimalToRewardFraction(commissionRates?.bakingCommission),
    transactionFeeCommission: decimalToRewardFraction(commissionRates?.transactionCommission),
    finalizationRewardCommission: decimalToRewardFraction(commissionRates?.finalizationCommission),
});

export function getConfigureBakerChanges(updates: ConfigureBakerFlowState, accountInfo?: AccountInfo) {
    const existing = accountInfo !== undefined ? getExistingBakerValues(accountInfo) : undefined;
    const changes = existing !== undefined ? getBakerFlowChanges(existing, updates) : updates;
    return changes;
}

/**
 * Converts values of flow to a configure baker payload.
 *
 * @throws if no changes to existing values have been made.
 */
export const configureBakerChangesPayload = (accountInfo?: AccountInfo) => (values: ConfigureBakerFlowState) => {
    const changes = getConfigureBakerChanges(values, accountInfo);

    if (Object.values(changes).every(not(isDefined))) {
        throw new Error(
            'Trying to submit a transaction without any changes to the existing baker configuration of an account.'
        );
    }

    return toPayload(changes);
};

function getFormOrExistingValue<T>(formValue?: T, existingBakerValue?: T) {
    if (formValue !== undefined) {
        return formValue;
    }
    if (existingBakerValue !== undefined) {
        return existingBakerValue;
    }

    // Either a value should have been set by the user in the form, or the account
    // should already be a baker with existing values. Otherwise this indicates an
    // error in the UI flow.
    throw new Error('Neither the form nor an existing baker value was available');
}

export function getCost(accountInfo: AccountInfo, formValues: Partial<ConfigureBakerFlowState>, amount: string) {
    const existingBakerValues = getExistingBakerValues(accountInfo);
    const formOrExistingAmount = getFormOrExistingValue(amount, existingBakerValues?.amount);

    const formValuesFull = {
        restake: getFormOrExistingValue(formValues.restake, existingBakerValues?.restake),
        openForDelegation: getFormOrExistingValue(formValues.openForDelegation, existingBakerValues?.openForDelegation),
        metadataUrl: getFormOrExistingValue(formValues.metadataUrl, existingBakerValues?.metadataUrl),
        commissionRates: getFormOrExistingValue(formValues.commissionRates, existingBakerValues?.commissionRates),
        keys: formValues.keys || null,
        amount: isValidCcdString(formOrExistingAmount) ? formOrExistingAmount : '0',
    };

    return getConfigureBakerEnergyCost(toPayload(getConfigureBakerChanges(formValuesFull, accountInfo)));
}
