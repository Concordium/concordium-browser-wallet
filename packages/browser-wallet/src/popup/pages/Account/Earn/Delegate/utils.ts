import {
    AccountInfo,
    CcdAmount,
    ConfigureDelegationPayload,
    DelegationTarget,
    DelegationTargetType,
    isDelegatorAccount,
} from '@concordium/web-sdk';
import { not } from '@shared/utils/function-helpers';
import { ccdToMicroCcd, DeepPartial, isDefined, microCcdToCcd, NotOptional } from 'wallet-common-helpers';

export type ConfigureDelegationFlowState = {
    pool: string | null;
    redelegate: boolean;
    /** In CCD */
    amount: string;
};

export const getExistingDelegationValues = (
    accountInfo: AccountInfo
): NotOptional<ConfigureDelegationFlowState> | undefined => {
    if (!isDelegatorAccount(accountInfo)) {
        return undefined;
    }

    const { delegationTarget, stakedAmount, restakeEarnings } = accountInfo.accountDelegation;

    return {
        amount: microCcdToCcd(stakedAmount) ?? '0.00',
        redelegate: restakeEarnings,
        pool: delegationTarget.delegateType === DelegationTargetType.Baker ? delegationTarget.bakerId.toString() : null,
    };
};

export type ConfigureDelegationFlowStateChanges = Partial<ConfigureDelegationFlowState>;

export const getDelegationFlowChanges = (
    existingValues: ConfigureDelegationFlowState,
    newValues: ConfigureDelegationFlowState
): ConfigureDelegationFlowStateChanges => {
    const changes: ConfigureDelegationFlowStateChanges = {};

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
    if (existingValues.redelegate !== newValues.redelegate) {
        changes.redelegate = newValues.redelegate;
    }

    if (existingValues.pool !== newValues.pool) {
        changes.pool = newValues.pool;
    }

    return changes;
};

function toPayload(values: DeepPartial<ConfigureDelegationFlowState>): ConfigureDelegationPayload {
    let delegationTarget: DelegationTarget | undefined;
    if (values.pool == null) {
        delegationTarget = { delegateType: DelegationTargetType.PassiveDelegation };
    } else if (values.pool !== undefined) {
        delegationTarget = { delegateType: DelegationTargetType.Baker, bakerId: BigInt(values.pool) };
    }
    return {
        stake: values?.amount ? new CcdAmount(ccdToMicroCcd(values.amount)) : undefined,
        restakeEarnings: values?.redelegate,
        delegationTarget,
    };
}

/**
 * Converts values of flow to a configure delegation payload.
 *
 * @param allowEmpty If allowEmpty is set to false, then this throws if no changes to existing values have been made.
 */
export const configureDelegationChangesPayload =
    (accountInfo?: AccountInfo, allowEmpty = true) =>
    (values: ConfigureDelegationFlowState) => {
        const existing = accountInfo !== undefined ? getExistingDelegationValues(accountInfo) : undefined;
        const changes = existing !== undefined ? getDelegationFlowChanges(existing, values) : values;

        if (!allowEmpty && Object.values(changes).every(not(isDefined))) {
            throw new Error(
                'Trying to submit a transaction without any changes to the existing delegation configuration of an account.'
            );
        }

        return toPayload(changes);
    };
