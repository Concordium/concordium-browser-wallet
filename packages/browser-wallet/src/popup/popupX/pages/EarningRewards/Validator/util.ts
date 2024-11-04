import { CcdAmount, OpenStatusText } from '@concordium/web-sdk';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import i18n from '@popup/shell/i18n';

export function showValidatorAmount(amount: CcdAmount.Type): string {
    return `${formatCcdAmount(amount)} CCD`;
}

export function showValidatorOpenStatus(status: OpenStatusText): string {
    switch (status) {
        case OpenStatusText.OpenForAll:
            return i18n.t('x:earn.validator.values.openStatus.open');
        case OpenStatusText.ClosedForAll:
            return i18n.t('x:earn.validator.values.openStatus.closed');
        case OpenStatusText.ClosedForNew:
            return i18n.t('x:earn.validator.values.openStatus.closedNew');
        default:
            throw new Error('Unsupported status');
    }
}

export function showRestake(value: boolean): string {
    return value
        ? i18n.t('x:earn.validator.values.restake.validation')
        : i18n.t('x:earn.validator.values.restake.public');
}
