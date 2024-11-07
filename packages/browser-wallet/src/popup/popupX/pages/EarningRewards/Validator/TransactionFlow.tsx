/* eslint-disable react/destructuring-assignment */
import React, { ComponentType, useCallback, useState } from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccountInfoType } from '@concordium/web-sdk';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import MultiStepForm from '@popup/shared/MultiStepForm';
import FullscreenNotice, { FullscreenNoticeProps } from '@popup/popupX/shared/FullscreenNotice';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';

import { ValidatorForm, ValidatorFormExisting, configureValidatorFromForm } from './util';
import ValidatorStake from './Stake';
import { type ValidationResultLocationState } from './Result';
import OpenPool from './OpenPool';
import Keys from './Keys';
import Metadata from './Metadata';
import Commissions from './Commissions';

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

/** The props passed to a component from {@linkcode withChangeValidation} */
type ChangeValidationProps = {
    /** Handler function for when the flow steps have all been completed */
    onDone(values: ValidatorForm | ValidatorFormExisting): void;
    /** The initial values for the flow, which will be either the existing validator properties on chain, or the values set previously in the flow. */
    initial: ValidatorForm | ValidatorFormExisting;
};

/** HOC for creating a flow for updating validator properties */
function withChangeValidation(Flow: ComponentType<ChangeValidationProps>) {
    return function Component() {
        const { state, pathname } = useLocation() as Location & {
            state: ValidatorForm | ValidatorFormExisting | undefined;
        };
        const accountInfo = useSelectedAccountInfo();
        const nav = useNavigate();
        const [noChangesNotice, setNoChangesNotice] = useState(false);

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

        const existing: ValidatorFormExisting = {
            stake: {
                amount: formatCcdAmount(stakedAmount),
                restake: restakeEarnings,
            },
            status: bakerPoolInfo.openStatus,
            metadataUrl: bakerPoolInfo.metadataUrl,
            commissions: bakerPoolInfo.commissionRates,
        };

        const initial = state ?? existing;

        const handleDone = (form: ValidatorForm) => {
            const payload = configureValidatorFromForm(form, existing);

            if (Object.values(payload).every((v) => v === undefined)) {
                setNoChangesNotice(true);
                return;
            }

            nav(pathname, { replace: true, state: form }); // Override current router entry with stateful version

            const submitDelegatorState: ValidationResultLocationState = {
                payload,
                type: 'change',
            };
            nav(absoluteRoutes.settings.earn.validator.submit.path, { state: submitDelegatorState });
        };
        return (
            <>
                <NoChangesNotice open={noChangesNotice} onClose={() => setNoChangesNotice(false)} />
                <Flow initial={initial} onDone={handleDone} />
            </>
        );
    };
}

/** Flow for updating the stake of a validator */
export const UpdateValidatorStakeTransactionFlow = withChangeValidation(({ initial, onDone }) => {
    const chainParams = useBlockChainParametersAboveV0();
    const store = useState<Partial<ValidatorForm>>(initial ?? {});
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.update' });

    return (
        <MultiStepForm<ValidatorForm> onDone={onDone} valueStore={store}>
            {{
                stake: {
                    render(stepInitial, onNext) {
                        if (chainParams === undefined) {
                            return null;
                        }
                        return (
                            <ValidatorStake
                                title={t('title')}
                                onSubmit={onNext}
                                initialValues={stepInitial}
                                minStake={chainParams.minimumEquityCapital}
                            />
                        );
                    },
                },
            }}
        </MultiStepForm>
    );
});

/** Flow for updating the pool settings of a validator */
export const UpdateValidatorPoolSettingsTransactionFlow = withChangeValidation(({ initial, onDone }) => {
    const chainParams = useBlockChainParametersAboveV0();
    const store = useState<Partial<ValidatorForm>>(initial ?? {});

    return (
        <MultiStepForm<ValidatorForm> onDone={onDone} valueStore={store}>
            {{
                status: {
                    render(stepInitial, onNext) {
                        return <OpenPool initial={stepInitial} onSubmit={onNext} />;
                    },
                },
                commissions: {
                    render(stepInitial, onNext) {
                        if (chainParams === undefined) {
                            return null;
                        }
                        return <Commissions initial={stepInitial} onSubmit={onNext} chainParams={chainParams} />;
                    },
                },
                metadataUrl: {
                    render(stepInitial, onNext) {
                        return <Metadata initial={stepInitial} onSubmit={onNext} />;
                    },
                },
            }}
        </MultiStepForm>
    );
});

/** Flow for updating the keys associated with a validator */
export const UpdateValidatorKeysTransactionFlow = withChangeValidation(({ initial, onDone }) => {
    const store = useState<Partial<ValidatorForm>>(initial ?? {});

    return (
        <MultiStepForm<ValidatorForm> onDone={onDone} valueStore={store}>
            {{
                keys: {
                    render(stepInitial, onNext) {
                        return <Keys onSubmit={onNext} initial={stepInitial} />;
                    },
                },
            }}
        </MultiStepForm>
    );
});
