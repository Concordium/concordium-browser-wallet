import React from 'react';
import Button from '@popup/popupX/shared/Button';
import { ToggleCheckbox } from '@popup/popupX/shared/Form/ToggleCheckbox';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { DelegationTargetType } from '@concordium/web-sdk';
import { useForm } from '@popup/popupX/shared/Form';

/** The form values for delegator stake configuration step */
export type DelegatorStakeForm = {
    /** in CCD */
    amount: string;
    /** Whether to add rewards to the stake or not */
    redelegate: boolean;
};

type Props = {
    /** The title for the configuriation step */
    title: string;
    /** The delegation target type */
    target: DelegationTargetType;
    /** The initial values of the step, if any */
    initialValues?: DelegatorStakeForm;
    /** The submit handler triggered when submitting the form in the step */
    onSubmit(values: DelegatorStakeForm): void;
};

export default function DelegatorStake({ title, target, initialValues, onSubmit }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.stake' });
    const form = useForm<DelegatorStakeForm>({
        defaultValues: initialValues ?? { amount: '0.00', redelegate: true },
    });
    const submit = form.handleSubmit(onSubmit);

    // FIXME: hardcoded...
    const account = 'Account 1 / 6gk...k7o';
    const balance = '17,800.00';
    const amount = '12,600.00'; // TODO: is it even feasible to render it like this when it's input??
    const fee = '0,32';
    const poolStake = '300,000.00';
    const poolCap = '56,400.00';

    return (
        <Page className="register-delegator-container">
            <Page.Top heading={title} />
            <span className="capture__main_small m-l-5 m-t-neg-5">{t('selectedAccount', { account })}</span>
            <div className="register-delegator__token-card">
                <div className="token">
                    <span className="text__main_regular">{t('token.label')}</span>
                    <div className="token-available">
                        <span className="text__main_regular">{t('token.value')}</span>
                        <span className="text__main_small"> {t('token.balance', { balance })}</span>
                    </div>
                </div>
                <div className="amount">
                    <span className="text__main_regular">{t('inputAmount.label')}</span>
                    <div className="amount-selected">
                        <span className="heading_big">{amount}</span>
                        <span className="capture__additional_small">{t('inputAmount.buttonMax')}</span>
                    </div>
                </div>
                <div className="estimated-fee">
                    <span className="capture__main_small">{t('fee.label')}</span>
                    <span className="capture__main_small">{t('fee.value', { amount: fee })}</span>
                </div>
            </div>
            {target === DelegationTargetType.Baker && (
                <div className="register-delegator__pool-info">
                    <div className="register-delegator__pool-info_row">
                        <span className="capture__main_small">{t('poolStake.label')}</span>
                        <span className="capture__main_small">{t('poolStake.value', { amount: poolStake })}</span>
                    </div>
                    <div className="register-delegator__pool-info_row">
                        <span className="capture__main_small">{t('poolCap.label')}</span>
                        <span className="capture__main_small">{t('poolCap.value', { amount: poolCap })}</span>
                    </div>
                </div>
            )}
            <div className="register-delegator__reward">
                <div className="register-delegator__reward_auto-add">
                    <span className="text__main">{t('redelegate.label')}</span>
                    <ToggleCheckbox />
                </div>
                <span className="capture__main_small">{t('redelegate.description')}</span>
            </div>
            <Page.Footer>
                <Button.Main className="m-t-20" label={t('buttonContinue')} onClick={submit} />
            </Page.Footer>
        </Page>
    );
}
