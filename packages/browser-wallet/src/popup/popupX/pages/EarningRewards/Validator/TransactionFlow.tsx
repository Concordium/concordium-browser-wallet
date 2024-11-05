/* eslint-disable react/destructuring-assignment */
import React, { useCallback, useState } from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountInfoType } from '@concordium/web-sdk';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import MultiStepForm from '@popup/shared/MultiStepForm';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import FullscreenNotice, { FullscreenNoticeProps } from '@popup/popupX/shared/FullscreenNotice';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { ValidatorForm, ValidatorFormExisting, configureValidatorFromForm } from './util';
import ValidatorStake from './Stake';
import { type ValidationResultLocationState } from './Result';
import OpenPool from './OpenPool';
import Keys from './Keys';
import Metadata from './Metadata';

// TODO:
// - Form steps

// TODO: use this when implementing update flows
function NoChangesNotice(props: FullscreenNoticeProps) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.update.noChangesNotice' });
    return (
        <FullscreenNotice {...props}>
            <Page>
                <Page.Top heading={t('title')} />
                {t('description')}
                <Page.Footer>
                    <Button.Main label={t('buttonBack')} onClick={props.onClose} />
                </Page.Footer>
            </Page>
        </FullscreenNotice>
    );
}

type Props = {
    title: string;
    existingValues?: ValidatorFormExisting | undefined;
};

function ValidatorTransactionFlow({ existingValues, title }: Props) {
    const { state, pathname } = useLocation() as Location & { state: ValidatorForm | undefined };
    const nav = useNavigate();

    const initialValues = state ?? existingValues;
    const store = useState<Partial<ValidatorForm>>(initialValues ?? {});

    const handleDone = useCallback(
        (form: ValidatorForm) => {
            const payload = configureValidatorFromForm(form);

            nav(pathname, { replace: true, state: form }); // Override current router entry with stateful version

            const submitDelegatorState: ValidationResultLocationState = {
                payload,
                type: 'register',
            };
            nav(absoluteRoutes.settings.earn.validator.submit.path, { state: submitDelegatorState });
        },
        [pathname, existingValues]
    );

    return (
        <MultiStepForm<ValidatorForm> onDone={handleDone} valueStore={store}>
            {{
                stake: {
                    render(initial, onNext) {
                        return <ValidatorStake title={title} onSubmit={onNext} initialValues={initial} />;
                    },
                },
                status: {
                    render(initial, onNext) {
                        return <OpenPool initial={initial} onSubmit={onNext} />;
                    },
                },
                // commissions: {}, // TODO: ...
                metadataUrl: {
                    render(initial, onNext) {
                        return <Metadata initial={initial} onSubmit={onNext} />;
                    },
                },
                keys: {
                    render(initial, onNext) {
                        return <Keys onSubmit={onNext} initial={initial} />;
                    },
                },
            }}
        </MultiStepForm>
    );
}

export function RegisterValidatorTransactionFlow() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.register' });
    return <ValidatorTransactionFlow title={t('title')} />;
}

export function UpdateValidatorTransactionFlow() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.update' });
    const accountInfo = useSelectedAccountInfo();

    if (
        accountInfo === undefined ||
        accountInfo.type !== AccountInfoType.Baker ||
        accountInfo.accountBaker.version === 0
    ) {
        return null;
    }
    const {
        accountBaker: { stakedAmount, restakeEarnings, bakerPoolInfo },
    } = accountInfo;

    const values: ValidatorFormExisting = {
        stake: {
            amount: formatCcdAmount(stakedAmount),
            restake: restakeEarnings,
        },
        status: bakerPoolInfo.openStatus,
        metadataUrl: bakerPoolInfo.metadataUrl,
        commissions: bakerPoolInfo.commissionRates,
    };

    return <ValidatorTransactionFlow existingValues={values} title={t('title')} />;
}
