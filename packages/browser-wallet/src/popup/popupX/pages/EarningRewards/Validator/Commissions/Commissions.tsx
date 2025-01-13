import React, { useCallback, useMemo } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { ChainParameters, ChainParametersV0, CommissionRange, CommissionRates } from '@concordium/web-sdk';
import Form, { useForm } from '@popup/popupX/shared/Form';
import FormSlider from '@popup/popupX/shared/Form/Slider/Slider';
import { PropsOf } from 'wallet-common-helpers';
import { isRange } from '../util';

const COMMISSION_STEP = 0.001;

type Props = {
    initial?: CommissionRates;
    onSubmit(values: CommissionRates): void;
    chainParams: Exclude<ChainParameters, ChainParametersV0>;
};

export default function Commissions({ initial, onSubmit, chainParams }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.commissions' });
    const { bakingCommissionRange, finalizationCommissionRange, transactionCommissionRange } = chainParams;
    const defaultValues: CommissionRates = useMemo(
        () => ({
            bakingCommission: (initial?.bakingCommission ?? bakingCommissionRange.max) * 100,
            transactionCommission: (initial?.transactionCommission ?? transactionCommissionRange.max) * 100,
            finalizationCommission: (initial?.finalizationCommission ?? finalizationCommissionRange.max) * 100,
        }),
        [initial, chainParams]
    );
    const form = useForm({ defaultValues });

    const commissionRules = useCallback(
        (range: CommissionRange): PropsOf<typeof FormSlider>['rules'] => {
            const min = range.min * 100;
            const max = range.max * 100;
            return {
                min: { value: min, message: t('error.min', { min }) },
                max: { value: max, message: t('error.max', { max }) },
                required: t('error.required'),
            };
        },
        [t]
    );

    const handleSubmit = useCallback(
        (values: CommissionRates) => {
            const fractions: CommissionRates = {
                transactionCommission: values.transactionCommission / 100,
                bakingCommission: values.bakingCommission / 100,
                finalizationCommission: values.finalizationCommission / 100,
            };

            onSubmit(fractions);
        },
        [onSubmit]
    );

    return (
        <Page className="validator-commissions">
            <Page.Top heading={t('title')} />
            <Text.Capture>{t('desciption')}</Text.Capture>
            <Form formMethods={form} onSubmit={handleSubmit} className="validator-commissions__form">
                {(f) => (
                    <>
                        {isRange(transactionCommissionRange) && (
                            <FormSlider
                                control={f.control}
                                name="transactionCommission"
                                label={t('fieldTransactionFee.label')}
                                min={transactionCommissionRange.min * 100}
                                max={transactionCommissionRange.max * 100}
                                rules={commissionRules(transactionCommissionRange)}
                                step={COMMISSION_STEP}
                                unit="%"
                            />
                        )}
                        {isRange(bakingCommissionRange) && (
                            <FormSlider
                                control={f.control}
                                name="bakingCommission"
                                label={t('fieldBlockReward.label')}
                                min={bakingCommissionRange.min * 100}
                                max={bakingCommissionRange.max * 100}
                                rules={commissionRules(bakingCommissionRange)}
                                step={COMMISSION_STEP}
                                unit="%"
                            />
                        )}
                        {isRange(finalizationCommissionRange) && (
                            <FormSlider
                                control={f.control}
                                name="finalizationCommission"
                                label={t('fieldFinalizationReward.label')}
                                min={finalizationCommissionRange.min * 100}
                                max={finalizationCommissionRange.max * 100}
                                rules={commissionRules(finalizationCommissionRange)}
                                step={COMMISSION_STEP}
                                unit="%"
                            />
                        )}
                    </>
                )}
            </Form>
            <Page.Footer>
                <Button.Main label={t('buttonContinue')} onClick={form.handleSubmit(handleSubmit)} />
            </Page.Footer>
        </Page>
    );
}
