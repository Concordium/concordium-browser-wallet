import MultiStepForm from '@popup/popupX/shared/MultiStepForm';
import React, { useCallback } from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import DelegatorStake, { DelegatorStakeForm } from '../Stake';
import DelegatorType, { DelegationTypeForm } from '../Type';

/** Represents the form data for a configure delegator transaction. */
type DelegatorForm = {
    /** The delegation target configuration */
    target: DelegationTypeForm;
    /** The delegation stake configuration */
    stake: DelegatorStakeForm;
};

export default function TransactionFlow() {
    const { state: initialValues, pathname } = useLocation() as Location & { state: DelegatorForm | undefined };
    const nav = useNavigate();

    const handleDone = useCallback(
        (values: DelegatorForm) => {
            nav(pathname, { replace: true, state: values }); // Override current router entry with stateful version
        },
        [pathname]
    );

    return (
        <MultiStepForm<DelegatorForm> onDone={handleDone} initialValues={initialValues}>
            {{
                target: {
                    render: (initial, onNext) => <DelegatorType initialValues={initial} onSubmit={onNext} />,
                },
                stake: {
                    render: () => <DelegatorStake />,
                },
            }}
        </MultiStepForm>
    );
}
