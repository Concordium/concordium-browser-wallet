import {
    AccountInfo,
    CcdAmount,
    ConfigureDelegationPayload,
    DelegationTargetType,
    isDelegatorAccount,
} from '@concordium/web-sdk';
import { not } from '@shared/utils/function-helpers';
import { ccdToMicroCcd, DeepPartial, isDefined, MakeRequired, microCcdToCcd, NotOptional } from 'wallet-common-helpers';

export type ConfigureDelegationFlowState = {
    pool: string | null;
    settings: {
        amount: string; // in CCD.
        redelegate: boolean;
    };
};

export const getExistingDelegationValues = (
    accountInfo: AccountInfo
): NotOptional<ConfigureDelegationFlowState> | undefined => {
    if (!isDelegatorAccount(accountInfo)) {
        return undefined;
    }

    const { delegationTarget, stakedAmount, restakeEarnings } = accountInfo.accountDelegation;

    return {
        settings: {
            amount: microCcdToCcd(stakedAmount) ?? '0.00',
            redelegate: restakeEarnings,
        },
        pool: delegationTarget.delegateType === DelegationTargetType.Baker ? delegationTarget.bakerId.toString() : null,
    };
};

export type ConfigureDelegationFlowStateChanges = MakeRequired<DeepPartial<ConfigureDelegationFlowState>, 'settings'>;

export const getDelegationFlowChanges = (
    existingValues: ConfigureDelegationFlowState,
    newValues: ConfigureDelegationFlowState
): ConfigureDelegationFlowStateChanges => {
    const changes: ConfigureDelegationFlowStateChanges = {
        settings: {},
    };

    try {
        if (
            existingValues.settings?.amount === undefined ||
            newValues.settings?.amount === undefined ||
            ccdToMicroCcd(existingValues.settings?.amount) !== ccdToMicroCcd(newValues.settings?.amount)
        ) {
            changes.settings.amount = newValues.settings?.amount;
        }
    } catch {
        // Nothing...
    }
    if (existingValues.settings?.redelegate !== newValues.settings?.redelegate) {
        changes.settings.redelegate = newValues.settings?.redelegate;
    }

    if (existingValues.pool !== newValues.pool) {
        changes.pool = newValues.pool;
    }

    return changes;
};

const toPayload = (values: DeepPartial<ConfigureDelegationFlowState>): ConfigureDelegationPayload => ({
    stake: values?.settings?.amount ? new CcdAmount(ccdToMicroCcd(values.settings.amount)) : undefined,
    restakeEarnings: values?.settings?.redelegate,
    delegationTarget:
        values.pool != null
            ? { delegateType: DelegationTargetType.Baker, bakerId: BigInt(values.pool) }
            : { delegateType: DelegationTargetType.PassiveDelegation },
});

/**
 * Converts values of flow to a configure delegation payload.
 *
 * Throws if no changes to existing values have been made.
 */
export const configureDelegationChangesPayload =
    (accountInfo?: AccountInfo) => (values: ConfigureDelegationFlowState) => {
        const existing = accountInfo !== undefined ? getExistingDelegationValues(accountInfo) : undefined;
        const changes = existing !== undefined ? getDelegationFlowChanges(existing, values) : values;
        const { settings, ...topLevelChanges } = changes;

        if (Object.values({ ...settings, ...topLevelChanges }).every(not(isDefined))) {
            throw new Error(
                'Trying to submit a transaction without any changes to the existing delegation configuration of an account.'
            );
        }

        return toPayload(changes);
    };
