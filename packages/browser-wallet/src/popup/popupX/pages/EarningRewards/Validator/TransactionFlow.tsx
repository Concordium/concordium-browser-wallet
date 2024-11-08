/* eslint-disable react/destructuring-assignment */
import React, { useCallback, useState } from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import MultiStepForm from '@popup/shared/MultiStepForm';
import FullscreenNotice, { FullscreenNoticeProps } from '@popup/popupX/shared/FullscreenNotice';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';

import { ValidatorForm, configureValidatorFromForm } from './util';
import ValidatorStake from './Stake';
import { type ValidationResultLocationState } from './Result';
import OpenPool from './OpenPool';
import Keys from './Keys';
import Metadata from './Metadata';
import Commissions from './Commissions';

// TODO: use this when implementing update flows
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export function RegisterValidatorTransactionFlow() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.register' });
    const { state, pathname } = useLocation() as Location & { state: ValidatorForm | undefined };
    const chainParams = useBlockChainParametersAboveV0();
    const nav = useNavigate();

    const initialValues = state;
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
        [pathname]
    );

    return (
        <MultiStepForm<ValidatorForm> onDone={handleDone} valueStore={store}>
            {{
                stake: {
                    render(initial, onNext) {
                        if (chainParams === undefined) {
                            return null;
                        }
                        return (
                            <ValidatorStake
                                title={t('title')}
                                onSubmit={onNext}
                                initialValues={initial}
                                minStake={chainParams.minimumEquityCapital}
                            />
                        );
                    },
                },
                status: {
                    render(initial, onNext) {
                        return <OpenPool initial={initial} onSubmit={onNext} />;
                    },
                },
                commissions: {
                    render(initial, onNext) {
                        if (chainParams === undefined) {
                            return null;
                        }
                        return <Commissions initial={initial} onSubmit={onNext} chainParams={chainParams} />;
                    },
                },
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
