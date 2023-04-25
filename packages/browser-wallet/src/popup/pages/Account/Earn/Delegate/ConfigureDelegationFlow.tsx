import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    AccountInfo,
    AccountTransactionType,
    BakerPoolStatus,
    isDelegatorAccount,
    OpenStatusText,
} from '@concordium/web-sdk';
import { Trans, useTranslation } from 'react-i18next';
import { ccdToMicroCcd, displayAsCcd, getCcdSymbol, useAsyncMemo, useUpdateEffect } from 'wallet-common-helpers';
import { Validate } from 'react-hook-form';
import SidedRow from '@popup/shared/SidedRow';

import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import Form, { useForm } from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import { FormRadios } from '@popup/shared/Form/Radios/Radios';
import FormInput from '@popup/shared/Form/Input';
import ExternalLink from '@popup/shared/ExternalLink';
import FormAmountInput from '@popup/shared/Form/AmountInput';
import { validateDelegationAmount } from '@popup/shared/utils/transaction-helpers';
import { convertEnergyToMicroCcd, getConfigureDelegationMaxEnergyCost } from '@shared/utils/energy-helpers';
import { useAtomValue } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import DisabledAmountInput from '@popup/shared/DisabledAmountInput/DisabledAmountInput';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { configureDelegationChangesPayload, ConfigureDelegationFlowState } from './utils';
import AccountTransactionFlow from '../../AccountTransactionFlow';
import { accountPageContext } from '../../utils';
import { isAboveStakeWarningThreshold, STAKE_WARNING_THRESHOLD } from '../utils';
import { AmountWarning, WarningModal } from '../Warning';

type PoolPageForm =
    | {
          isBaker: false;
      }
    | {
          isBaker: true;
          bakerId: string;
      };

type WithAccountInfo = {
    accountInfo: AccountInfo;
};

type PoolPageProps = Omit<
    MultiStepFormPageProps<ConfigureDelegationFlowState['pool'], ConfigureDelegationFlowState>,
    'formValues'
> &
    WithAccountInfo;

function PoolPage({ onNext, initial, accountInfo }: PoolPageProps) {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.configure' });
    const { t: tShared } = useTranslation('shared');
    const client = useAtomValue(grpcClientAtom);
    const form = useForm<PoolPageForm>({
        defaultValues: initial === null ? { isBaker: false } : { isBaker: true, bakerId: initial },
    });
    const isBakerValue = form.watch('isBaker');

    const validateBakerId: Validate<string> = async (value) => {
        try {
            const bakerId = BigInt(value);
            const poolStatus = await client.getPoolInfo(bakerId);

            if (poolStatus.poolInfo.openStatus !== OpenStatusText.OpenForAll) {
                return t('pool.targetNotOpenForAll');
            }

            if (
                isDelegatorAccount(accountInfo) &&
                poolStatus.delegatedCapitalCap - poolStatus.delegatedCapital <
                    accountInfo.accountDelegation.stakedAmount
            ) {
                return t('pool.currentStakeExceedsCap');
            }
            return true;
        } catch {
            return t('pool.notABaker');
        }
    };

    useUpdateEffect(() => {
        if (!isBakerValue) {
            form.resetField('bakerId');
        }
    }, [isBakerValue]);

    const onSubmit = (vs: PoolPageForm) => {
        if (vs.isBaker) {
            onNext(vs.bakerId);
        } else {
            onNext(null);
        }
    };

    return (
        <Form<PoolPageForm> className="configure-flow-form" formMethods={form} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div>
                        {t('pool.description1')}
                        <FormRadios
                            className="m-t-20 w-full"
                            control={f.control}
                            name="isBaker"
                            options={[
                                { value: true, label: t('pool.optionBaker') },
                                { value: false, label: t('pool.optionPassive') },
                            ]}
                        />
                        {isBakerValue ? (
                            <>
                                <FormInput
                                    className="m-t-10"
                                    register={f.register}
                                    name="bakerId"
                                    label={t('pool.bakerIdLabel')}
                                    autoFocus
                                    rules={{ required: t('pool.bakerIdRequired'), validate: validateBakerId }}
                                />
                                <div className="m-t-20">
                                    <Trans
                                        ns="account"
                                        i18nKey="delegate.configure.pool.descriptionBaker"
                                        components={{
                                            1: (
                                                <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                                            ),
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="m-t-20">
                                <Trans
                                    ns="account"
                                    i18nKey="delegate.configure.pool.descriptionPassive"
                                    components={{
                                        1: (
                                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                                        ),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <Submit className="m-t-20" width="wide">
                        {tShared('continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}

interface DisplayPoolStatusProps {
    status: BakerPoolStatus;
}

function DisplayPoolStatus({ status }: DisplayPoolStatusProps) {
    return (
        <div className="delegation__pool-status">
            <SidedRow className="m-t-5" left="Current pool:" right={displayAsCcd(status.delegatedCapital).toString()} />
            <SidedRow
                className="m-t-5"
                left="Pool limit:"
                right={displayAsCcd(status.delegatedCapitalCap).toString()}
            />
        </div>
    );
}

type AmountPageForm = {
    amount: string;
};

type AmountPageProps = MultiStepFormPageProps<ConfigureDelegationFlowState['amount'], ConfigureDelegationFlowState> &
    WithAccountInfo;
function AmountPage({ initial, onNext, formValues, accountInfo }: AmountPageProps) {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.configure' });
    const { t: tShared } = useTranslation('shared');
    const { setDetailsExpanded } = useContext(accountPageContext);
    const [openWarning, setOpenWarning] = useState<AmountWarning>(AmountWarning.None);
    const chainParameters = useBlockChainParameters();

    const defaultValues: Partial<AmountPageForm> = useMemo(
        () => (initial === undefined ? {} : { amount: initial }),
        [initial]
    );
    const client = useAtomValue(grpcClientAtom);

    const cost = useMemo(
        () => (chainParameters ? convertEnergyToMicroCcd(getConfigureDelegationMaxEnergyCost(), chainParameters) : 0n),
        [chainParameters]
    );

    const poolStatus = useAsyncMemo(
        async () => (formValues.pool ? client.getPoolInfo(BigInt(formValues.pool)) : undefined),
        undefined,
        []
    );

    const validateAmount: Validate<string> = (amountToValidate) =>
        validateDelegationAmount(amountToValidate, accountInfo, cost, poolStatus);

    useEffect(() => {
        setDetailsExpanded(true);
        return () => setDetailsExpanded(false);
    }, []);

    const onSubmit = (vs: AmountPageForm) => {
        const amount = ccdToMicroCcd(vs.amount);
        // If the default value i.e. current stake or previosly chosen stake is already above the threshold, do not display the warning
        if (
            !(initial && isAboveStakeWarningThreshold(ccdToMicroCcd(initial), accountInfo)) &&
            isAboveStakeWarningThreshold(amount, accountInfo)
        ) {
            setOpenWarning(AmountWarning.AboveThreshold);
        } else if (isDelegatorAccount(accountInfo) && accountInfo.accountDelegation.stakedAmount > amount) {
            setOpenWarning(AmountWarning.Decrease);
        } else {
            onNext(vs.amount);
        }
    };

    const pendingChange =
        isDelegatorAccount(accountInfo) && accountInfo.accountDelegation.pendingChange?.change !== undefined;

    return (
        <Form<AmountPageForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <WarningModal
                        onCancel={() => setOpenWarning(AmountWarning.None)}
                        onContinue={f.handleSubmit((vs) => onNext(vs.amount))}
                        thresholdWarning={t('amount.overStakeThresholdWarning', {
                            threshold: STAKE_WARNING_THRESHOLD.toString(),
                        })}
                        decreaseWarning={t('amount.decreaseWarning')}
                        cancelText={t('amount.enterNewStake')}
                        warningState={openWarning}
                    />
                    <div className="w-full">
                        <p className="m-t-0 text-center">{t('amount.description')}</p>
                        {pendingChange && (
                            <DisabledAmountInput
                                className="delegation__amount-input"
                                label={t('amount.locked')}
                                note={t('amount.lockedNote')}
                            />
                        )}
                        {!pendingChange && (
                            <FormAmountInput
                                label={t('amount.amountLabel')}
                                autoFocus
                                register={f.register}
                                symbol={getCcdSymbol()}
                                className="earn__amount-input"
                                name="amount"
                                rules={{
                                    required: t('amount.amountRequired'),
                                    validate: validateAmount,
                                }}
                            />
                        )}
                    </div>
                    {poolStatus && <DisplayPoolStatus status={poolStatus} />}
                    <Submit className="m-t-20" width="wide">
                        {tShared('continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}

type RestakePageForm = {
    redelegate: boolean;
};

type RestakePageProps = MultiStepFormPageProps<
    ConfigureDelegationFlowState['redelegate'],
    ConfigureDelegationFlowState
>;

function RestakePage({ initial, onNext }: RestakePageProps) {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.configure' });
    const { t: tShared } = useTranslation('shared');
    const defaultValues: Partial<RestakePageForm> = useMemo(
        () => (initial === undefined ? { redelegate: true } : { redelegate: initial }),
        [initial]
    );
    const onSubmit = (vs: RestakePageForm) => onNext(vs.redelegate);

    return (
        <Form<RestakePageForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div>
                        <div className="m-t-0">{t('amount.descriptionRedelegate')}</div>
                        <FormRadios
                            className="m-t-20 w-full"
                            control={f.control}
                            name="redelegate"
                            options={[
                                { value: true, label: t('amount.optionRedelegate') },
                                { value: false, label: t('amount.optionNoRedelegate') },
                            ]}
                        />
                    </div>
                    <Submit className="m-t-20" width="wide">
                        {tShared('continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}

type Props = {
    title: string;
    firstPageBack?: boolean;
    onConvertError?: (e: Error) => void;
};

export default function ConfigureDelegationFlow({ onConvertError, ...props }: Props) {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');
    const valuesToPayload = useCallback(configureDelegationChangesPayload(accountInfo, false), [accountInfo]);

    return (
        <AccountTransactionFlow<ConfigureDelegationFlowState>
            {...props}
            firstPageBack
            convert={valuesToPayload}
            transactionType={AccountTransactionType.ConfigureDelegation}
            handleDoneError={onConvertError}
        >
            {{
                pool: {
                    render: (initial, onNext) => (
                        <PoolPage initial={initial} onNext={onNext} accountInfo={accountInfo} />
                    ),
                },
                redelegate: {
                    render: (initial, onNext, formValues) => (
                        <RestakePage initial={initial} onNext={onNext} formValues={formValues} />
                    ),
                },
                amount: {
                    render: (initial, onNext, formValues) => (
                        <AmountPage
                            initial={initial}
                            onNext={onNext}
                            formValues={formValues}
                            accountInfo={accountInfo}
                        />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}
