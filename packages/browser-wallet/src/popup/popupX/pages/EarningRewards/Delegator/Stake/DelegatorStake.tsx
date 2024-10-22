import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import Button from '@popup/popupX/shared/Button';
import FormToggleCheckbox from '@popup/popupX/shared/Form/ToggleCheckbox';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { CcdAmount, DelegationTargetType } from '@concordium/web-sdk';
import Form, { useForm } from '@popup/popupX/shared/Form';
import TokenAmount, { AmountForm } from '@popup/popupX/shared/Form/TokenAmount';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { displayNameAndSplitAddress, useSelectedCredential } from '@popup/shared/utils/account-helpers';

/** The form values for delegator stake configuration step */
export type DelegatorStakeForm = AmountForm & {
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
    const selectedCred = useSelectedCredential();
    const selectedAccountInfo = useAccountInfo(selectedCred);

    if (selectedAccountInfo === undefined || selectedCred === undefined) {
        return null;
    }

    // FIXME: hardcoded...
    const accountShow = displayNameAndSplitAddress(selectedCred);
    const fee = CcdAmount.fromCcd(0.032);
    const poolStake = '300,000.00';
    const poolCap = '56,400.00';

    return (
        <Page className="register-delegator-container">
            <Page.Top heading={title} />
            <span className="capture__main_small m-l-5 m-t-neg-5">
                {t('selectedAccount', { account: accountShow })}
            </span>
            <Form formMethods={form} onSubmit={onSubmit}>
                {(f) => (
                    <>
                        <TokenAmount
                            accountInfo={selectedAccountInfo}
                            fee={fee}
                            tokenType="ccd"
                            buttonMaxLabel={t('inputAmount.buttonMax')}
                            form={f as unknown as UseFormReturn<AmountForm>}
                        />
                        {target === DelegationTargetType.Baker && (
                            <div className="register-delegator__pool-info">
                                <div className="register-delegator__pool-info_row">
                                    <span className="capture__main_small">{t('poolStake.label')}</span>
                                    <span className="capture__main_small">
                                        {t('poolStake.value', { amount: poolStake })}
                                    </span>
                                </div>
                                <div className="register-delegator__pool-info_row">
                                    <span className="capture__main_small">{t('poolCap.label')}</span>
                                    <span className="capture__main_small">
                                        {t('poolCap.value', { amount: poolCap })}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="register-delegator__reward">
                            <div className="register-delegator__reward_auto-add">
                                <span className="text__main">{t('redelegate.label')}</span>
                                <FormToggleCheckbox register={f.register} name="redelegate" />
                            </div>
                            <span className="capture__main_small">{t('redelegate.description')}</span>
                        </div>
                    </>
                )}
            </Form>
            <Page.Footer>
                <Button.Main className="m-t-20" label={t('buttonContinue')} onClick={submit} />
            </Page.Footer>
        </Page>
    );
}
