import {
    CcdAmount,
    CommissionRange,
    CommissionRates,
    ConfigureBakerPayload,
    GenerateBakerKeysOutput,
    OpenStatus,
    OpenStatusText,
} from '@concordium/web-sdk';
import { AmountForm } from '@popup/popupX/shared/Form/TokenAmount';
import { formatCcdAmount, parseCcdAmount } from '@popup/popupX/shared/utils/helpers';
import i18n from '@popup/shell/i18n';

const FRACTION_RES = 100000;

export function showValidatorAmount(amount: CcdAmount.Type): string {
    return `${formatCcdAmount(amount)} CCD`;
}

export function showValidatorOpenStatus(status: OpenStatusText | OpenStatus): string {
    switch (status) {
        case OpenStatus.OpenForAll:
        case OpenStatusText.OpenForAll:
            return i18n.t('x:earn.validator.values.openStatus.open');
        case OpenStatus.ClosedForAll:
        case OpenStatusText.ClosedForAll:
            return i18n.t('x:earn.validator.values.openStatus.closed');
        case OpenStatus.ClosedForNew:
        case OpenStatusText.ClosedForNew:
            return i18n.t('x:earn.validator.values.openStatus.closedNew');
        default:
            throw new Error('Unsupported status');
    }
}

export function showValidatorRestake(value: boolean): string {
    return value
        ? i18n.t('x:earn.validator.values.restake.validation')
        : i18n.t('x:earn.validator.values.restake.public');
}

export function showCommissionRate(fraction: number): string {
    return `${(fraction * 100) / FRACTION_RES}%`;
}

export const isRange = (range: CommissionRange) => range.min !== range.max;

/** The form data for specifying validator stake */
export type ValidatorStakeForm = Omit<AmountForm, 'token'> & { restake: boolean };
export type ValidatorFormUpdateStake = { stake: ValidatorStakeForm };
export type ValidatorFormUpdateKeys = { keys: GenerateBakerKeysOutput };
export type ValidatorFormUpdateSettings = {
    status: OpenStatusText;
    commissions: CommissionRates;
    metadataUrl: string;
};

/** The cummulative validator form for declaring the data for the transaction for configuring validators */
export type ValidatorForm = ValidatorFormUpdateStake & ValidatorFormUpdateSettings & ValidatorFormUpdateKeys;

/** The existing values needed to compare with updates */
export type ValidatorFormExisting = Omit<ValidatorForm, 'keys'>;

const numToFraction = (value: number | undefined) =>
    value === undefined ? undefined : Math.floor(value * FRACTION_RES);

export function configureValidatorFromForm(
    values: Partial<ValidatorForm>,
    existingValues?: ValidatorFormExisting
): ConfigureBakerPayload {
    let restakeEarnings: boolean | undefined;
    if (values.stake?.restake !== existingValues?.stake.restake) {
        restakeEarnings = values.stake?.restake;
    }
    let stake: CcdAmount.Type | undefined;
    if (values.stake?.amount !== existingValues?.stake.amount && values.stake !== undefined) {
        stake = parseCcdAmount(values.stake.amount);
    }
    let openForDelegation: OpenStatus | undefined;
    if (values.status !== existingValues?.status) {
        switch (values.status) {
            case OpenStatusText.OpenForAll:
                openForDelegation = OpenStatus.OpenForAll;
                break;
            case OpenStatusText.ClosedForAll:
                openForDelegation = OpenStatus.ClosedForAll;
                break;
            case OpenStatusText.ClosedForNew:
                openForDelegation = OpenStatus.ClosedForNew;
                break;
            default:
                throw new Error('Unsupported status');
        }
    }
    let metadataUrl: string | undefined;
    if (values.metadataUrl !== existingValues?.metadataUrl) {
        metadataUrl = values.metadataUrl;
    }

    let bakingRewardCommission: number | undefined;
    if (values.commissions?.bakingCommission !== existingValues?.commissions.bakingCommission) {
        bakingRewardCommission = numToFraction(values.commissions?.bakingCommission);
    }
    let finalizationRewardCommission: number | undefined;
    if (values.commissions?.finalizationCommission !== existingValues?.commissions.finalizationCommission) {
        finalizationRewardCommission = numToFraction(values.commissions?.finalizationCommission);
    }
    let transactionFeeCommission: number | undefined;
    if (values.commissions?.transactionCommission !== existingValues?.commissions.transactionCommission) {
        transactionFeeCommission = numToFraction(values.commissions?.transactionCommission);
    }

    return {
        stake,
        restakeEarnings,
        openForDelegation,
        metadataUrl,
        bakingRewardCommission,
        transactionFeeCommission,
        finalizationRewardCommission,
        keys: values.keys,
    };
}
