import React, { useContext, useMemo } from 'react';
import { CommissionRates, isChainParametersV0, CommissionRange } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import { isValidResolutionString } from 'wallet-common-helpers';

import Form from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import { ConfigureBakerFlowState } from '../utils';
import CommissionField from './CommissionField';
import { earnPageContext } from '../../utils';

type CommissionsForm = CommissionRates;

type CommissionsProps = MultiStepFormPageProps<ConfigureBakerFlowState['commissionRates'], ConfigureBakerFlowState>;

const validationRules = (range: CommissionRange) => ({
    min: range.min * 100,
    max: range.max * 100,
    // Note: The error is not actually displayed, so this doesn't need to be translated.
    required: 'commission is required',
    validate: (v?: number) => {
        if (Number.isNaN(v)) {
            return 'Must be a number';
        }
        if (v && !isValidResolutionString(1000, false, true, false)(v.toString())) {
            return 'Must only have 3 decimals';
        }
        return undefined;
    },
});

export default function CommissionsPage({ initial, onNext }: CommissionsProps) {
    const { t: tShared } = useTranslation('shared');
    const { t } = useTranslation('account', { keyPrefix: 'baking.configure' });
    const { chainParameters } = useContext(earnPageContext);
    const defaultValues: Partial<CommissionsForm> = useMemo(() => (initial === undefined ? {} : initial), [initial]);
    const onSubmit = (vs: CommissionsForm) => onNext(vs);

    if (!chainParameters || isChainParametersV0(chainParameters)) {
        return null;
    }

    return (
        <Form<CommissionsForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div>
                        <div className="m-t-0 m-b-10">{t('commission.description')}</div>
                        <CommissionField
                            label={tShared('baking.transactionCommission')}
                            name="transactionCommission"
                            min={chainParameters.transactionCommissionRange.min}
                            max={chainParameters.transactionCommissionRange.max}
                            rules={validationRules(chainParameters.transactionCommissionRange)}
                            control={f.control}
                        />
                        <CommissionField
                            label={tShared('baking.bakingCommission')}
                            name="bakingCommission"
                            min={chainParameters.bakingCommissionRange.min}
                            max={chainParameters.bakingCommissionRange.max}
                            rules={validationRules(chainParameters.bakingCommissionRange)}
                            control={f.control}
                        />
                        <CommissionField
                            label={tShared('baking.finalizationCommission')}
                            name="finalizationCommission"
                            min={chainParameters.finalizationCommissionRange.min}
                            max={chainParameters.finalizationCommissionRange.max}
                            rules={validationRules(chainParameters.finalizationCommissionRange)}
                            control={f.control}
                        />
                    </div>
                    <Submit className="m-t-10" width="wide">
                        {tShared('continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
