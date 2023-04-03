import React, { useMemo } from 'react';
import { isBakerAccount, OpenStatus } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';

import Form from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import { FormRadios } from '@popup/shared/Form/Radios/Radios';
import { WithAccountInfo } from '@popup/shared/utils/account-helpers';
import { ConfigureBakerFlowState } from '../utils';

type OpenForDelegationForm = {
    openForDelegation: OpenStatus;
};

type OpenForDelegationProps = MultiStepFormPageProps<
    ConfigureBakerFlowState['openForDelegation'],
    ConfigureBakerFlowState
> &
    WithAccountInfo;

export default function OpenForDelegationPage({ initial, onNext, accountInfo }: OpenForDelegationProps) {
    const { t: tShared } = useTranslation('shared', { keyPrefix: 'baking' });
    const { t } = useTranslation('account', { keyPrefix: 'baking.configure' });
    const defaultValues: Partial<OpenForDelegationForm> = useMemo(
        () => (initial === undefined ? { openForDelegation: OpenStatus.ClosedForAll } : { openForDelegation: initial }),
        [initial]
    );
    const onSubmit = (vs: OpenForDelegationForm) => onNext(vs.openForDelegation);

    const options = useMemo(
        () => [
            { value: OpenStatus.OpenForAll, label: tShared('openForAll') },
            ...(isBakerAccount(accountInfo)
                ? [{ value: OpenStatus.ClosedForNew, label: tShared('closedForNew') }]
                : []),
            { value: OpenStatus.ClosedForAll, label: tShared('closedForAll') },
        ],
        []
    );

    return (
        <Form<OpenForDelegationForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div>
                        <div className="m-t-0">{t('openForDelegation.description')}</div>
                        <FormRadios
                            className="m-t-20 w-full"
                            control={f.control}
                            name="openForDelegation"
                            options={options}
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
