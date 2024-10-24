import React, { useCallback } from 'react';
import { Location, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import MultiStepForm from '@popup/popupX/shared/MultiStepForm';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import DelegatorStake from '../Stake';
import DelegatorType from '../Type';
import { configureDelegatorPayloadFromForm, type DelegatorForm } from '../util';
import { DelegationResultLocationState } from '../Result/DelegationResult';

export default function TransactionFlow() {
    const { state: initialValues, pathname } = useLocation() as Location & { state: DelegatorForm | undefined };
    const nav = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.register' });

    const handleDone = useCallback(
        (values: DelegatorForm) => {
            const payload = configureDelegatorPayloadFromForm(values);

            nav(pathname, { replace: true, state: values }); // Override current router entry with stateful version

            const submitDelegatorState: DelegationResultLocationState = { payload, type: 'register' };
            nav(absoluteRoutes.settings.earn.delegator.submit.path, { state: submitDelegatorState });
        },
        [pathname]
    );

    return (
        <MultiStepForm<DelegatorForm> onDone={handleDone} initialValues={initialValues}>
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
                            />
                        );
                    },
                },
            }}
        </MultiStepForm>
    );
}
