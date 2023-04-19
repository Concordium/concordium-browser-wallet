import { OpenStatus, OpenStatusText } from '@concordium/web-sdk';
import i18n from '@popup/shell/i18n';
import { toFixed } from 'wallet-common-helpers';

const fractionResolution = 100000;
const percentageModifier = fractionResolution / 100;

export const decimalToRewardFraction = (d: number | undefined) =>
    d === undefined ? undefined : d * percentageModifier;

const fractionResolutionToPercentage = (v: number) => v / percentageModifier;

export function openStatusToDisplay(status: OpenStatus | OpenStatusText): string {
    switch (status) {
        case OpenStatus.OpenForAll:
        case OpenStatusText.OpenForAll:
            return i18n.t('baking.openForAll');
        case OpenStatusText.ClosedForNew:
        case OpenStatus.ClosedForNew:
            return i18n.t('baking.closedForNew');
        case OpenStatusText.ClosedForAll:
        case OpenStatus.ClosedForAll:
            return i18n.t('baking.closedForAll');
        default:
            throw new Error(`Status not supported: ${status}`);
    }
}

const formatCommission = toFixed(0);

export const displayDecimalCommissionRate = (value: number) => formatCommission((value * 100).toString());
export const displayFractionCommissionRate = (value: number) =>
    `${formatCommission(fractionResolutionToPercentage(value).toString())}%`;
