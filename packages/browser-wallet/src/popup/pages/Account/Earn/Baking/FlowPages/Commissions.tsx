import React, { useContext, useMemo } from 'react';
import { CommissionRates, isChainParametersV0 } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';

import Form from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import { ConfigureBakerFlowState } from '../utils';
import CommissionField from './CommissionField';
import { earnPageContext } from '../../utils';

type CommissionsForm = CommissionRates;

type CommissionsProps = MultiStepFormPageProps<ConfigureBakerFlowState['commissionRates'], ConfigureBakerFlowState>;

export default function CommissionsPage({ initial, onNext }: CommissionsProps) {
    const { t: tShared } = useTranslation('shared', { keyPrefix: 'baking' });
    const { t } = useTranslation('account', { keyPrefix: 'baking.configure' });
    const defaultValues: Partial<CommissionsForm> = useMemo(() => (initial === undefined ? {} : initial), [initial]);
    const onSubmit = (vs: CommissionsForm) => onNext(vs);

    const { chainParameters } = useContext(earnPageContext);

    if (!chainParameters || isChainParametersV0(chainParameters)) {
        return null;
    }

    return (
        <Form<CommissionsForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div>
                        <div className="m-t-0">{t('commission.description')}</div>
                        <CommissionField
                            label={tShared('transactionCommission')}
                            name="transactionCommission"
                            min={chainParameters.transactionCommissionRange.min}
                            max={chainParameters.transactionCommissionRange.max}
                            register={f.register}
                        />
                        <CommissionField
                            label={tShared('bakingCommission')}
                            name="bakingCommission"
                            min={chainParameters.bakingCommissionRange.min}
                            register={f.register}
                            max={chainParameters.bakingCommissionRange.max}
                        />
                        <CommissionField
                            label={tShared('finalizationCommission')}
                            name="finalizationCommission"
                            min={chainParameters.finalizationCommissionRange.min}
                            register={f.register}
                            max={chainParameters.finalizationCommissionRange.max}
                        />
                    </div>
                    <Submit className="m-t-20" width="wide">
                        {t('continueButton')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
