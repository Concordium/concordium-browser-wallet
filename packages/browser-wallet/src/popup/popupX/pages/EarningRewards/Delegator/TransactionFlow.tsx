import React, { useCallback, useState } from 'react';
import { Location, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountInfoType, DelegationTargetType } from '@concordium/web-sdk';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import MultiStepForm from '@popup/shared/MultiStepForm';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import DelegatorStake from './Stake';
import DelegatorType from './Type';
import { configureDelegatorPayloadFromForm, type DelegatorForm } from './util';
import { DelegationResultLocationState } from './Result/DelegationResult';

type Props = {
    existingValues?: DelegatorForm | undefined;
};

export default function DelegatorTransactionFlow({ existingValues }: Props) {
    const { state, pathname } = useLocation() as Location & { state: DelegatorForm | undefined };
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.register' });
    const nav = useNavigate();

    const initialValues = state ?? existingValues;
    const store = useState<Partial<DelegatorForm>>(initialValues ?? {});

    const handleDone = useCallback(
        (form: DelegatorForm) => {
            const payload = configureDelegatorPayloadFromForm(form, existingValues);

            nav(pathname, { replace: true, state: form }); // Override current router entry with stateful version

            const submitDelegatorState: DelegationResultLocationState = { payload, type: 'register' };
            nav(absoluteRoutes.settings.earn.delegator.submit.path, { state: submitDelegatorState });
        },
        [pathname, existingValues]
    );

    return (
        <MultiStepForm<DelegatorForm> onDone={handleDone} valueStore={store}>
            {{
                target: {
                    render: (initial, onNext) => (
                        <DelegatorType initialValues={initial} onSubmit={onNext} title={t('title')} />
                    ),
                },
                stake: {
                    render: (initial, onNext, form) => {
                        if (form.target === undefined) {
                            return <Navigate to=".." />;
                        }

                        return (
                            <DelegatorStake
                                title={t('title')}
                                target={form.target}
                                onSubmit={onNext}
                                initialValues={initial}
                                existingValues={existingValues}
                            />
                        );
                    },
                },
            }}
        </MultiStepForm>
    );
}

export function UpdateDelegatorTransactionFlow() {
    const accountInfo = useSelectedAccountInfo();

    if (accountInfo === undefined || accountInfo.type !== AccountInfoType.Delegator) {
        return null;
    }
    const {
        accountDelegation: { stakedAmount, restakeEarnings, delegationTarget },
    } = accountInfo;

    const values: DelegatorForm = {
        stake: {
            amount: formatCcdAmount(stakedAmount),
            redelegate: restakeEarnings,
        },
        target:
            delegationTarget.delegateType === DelegationTargetType.PassiveDelegation
                ? { type: DelegationTargetType.PassiveDelegation }
                : { type: DelegationTargetType.Baker, bakerId: delegationTarget.bakerId.toString() },
    };

    return <DelegatorTransactionFlow existingValues={values} />;
}
