/* eslint-disable react/destructuring-assignment */
import React, { useCallback, useState } from 'react';
import { Location, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountInfoType, DelegationTargetType } from '@concordium/web-sdk';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import MultiStepForm from '@popup/shared/MultiStepForm';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import FullscreenNotice, { FullscreenNoticeProps } from '@popup/popupX/shared/FullscreenNotice';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';

import DelegatorStake from './Stake';
import DelegatorType from './Type';
import { configureDelegatorPayloadFromForm, type DelegatorForm } from './util';
import { DelegationResultLocationState } from './Result/DelegationResult';

function NoChangesNotice(props: FullscreenNoticeProps) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.update.noChangesNotice' });
    return (
        <FullscreenNotice {...props}>
            <Page>
                <Page.Top heading={t('title')} />
                <Text.Capture>{t('description')}</Text.Capture>
                <Page.Footer>
                    <Button.Main label={t('buttonBack')} onClick={props.onClose} />
                </Page.Footer>
            </Page>
        </FullscreenNotice>
    );
}

type Props = {
    title: string;
    existingValues?: DelegatorForm | undefined;
};

function DelegatorTransactionFlow({ existingValues, title }: Props) {
    const { state, pathname } = useLocation() as Location & { state: DelegatorForm | undefined };
    const nav = useNavigate();
    const [noChangesNotice, setNoChangesNotice] = useState(false);

    const initialValues = state ?? existingValues;
    const store = useState<Partial<DelegatorForm>>(initialValues ?? {});

    const handleDone = useCallback(
        (form: DelegatorForm) => {
            const payload = configureDelegatorPayloadFromForm(form, existingValues);

            if (Object.values(payload).every((v) => v === undefined)) {
                setNoChangesNotice(true);
                return;
            }

            nav(pathname, { replace: true, state: form }); // Override current router entry with stateful version

            const submitDelegatorState: DelegationResultLocationState = {
                payload,
                type: existingValues !== undefined ? 'change' : 'register',
            };
            nav(absoluteRoutes.settings.earn.delegator.submit.path, { state: submitDelegatorState });
        },
        [pathname, existingValues, setNoChangesNotice]
    );

    return (
        <>
            <NoChangesNotice open={noChangesNotice} onClose={() => setNoChangesNotice(false)} />
            <MultiStepForm<DelegatorForm> onDone={handleDone} valueStore={store}>
                {{
                    target: {
                        render: (initial, onNext) => (
                            <DelegatorType initialValues={initial} onSubmit={onNext} title={title} />
                        ),
                    },
                    stake: {
                        render: (initial, onNext, form) => {
                            if (form.target === undefined) {
                                return <Navigate to=".." />;
                            }

                            return (
                                <DelegatorStake
                                    title={title}
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
        </>
    );
}

export function RegisterDelegatorTransactionFlow() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.register' });
    return <DelegatorTransactionFlow title={t('title')} />;
}

export function UpdateDelegatorTransactionFlow() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.update' });
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

    return <DelegatorTransactionFlow existingValues={values} title={t('title')} />;
}
