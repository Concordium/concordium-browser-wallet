import React, { useContext, useEffect, useMemo, useState } from 'react';
import { isBakerAccount, convertEnergyToMicroCcd } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import { getCcdSymbol, ccdToMicroCcd, displayAsCcd } from 'wallet-common-helpers';
import { Validate } from 'react-hook-form';

import Form, { useForm } from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import FormAmountInput from '@popup/shared/Form/AmountInput';
import { validateBakerStake } from '@popup/shared/utils/transaction-helpers';
import { WithAccountInfo } from '@popup/shared/utils/account-helpers';
import { accountPageContext } from '@popup/pages/Account/utils';
import DisabledAmountInput from '@popup/shared/DisabledAmountInput';
import { getConfigureBakerMaxEnergyCost, getFullConfigureBakerMinEnergyCost } from '@shared/utils/energy-helpers';
import { earnPageContext, isAboveStakeWarningThreshold, STAKE_WARNING_THRESHOLD } from '../../utils';
import { ConfigureBakerFlowState, getCost } from '../utils';
import { AmountWarning, WarningModal } from '../../Warning';

type AmountPageForm = {
    amount: string;
};

type AmountPageProps = MultiStepFormPageProps<ConfigureBakerFlowState['amount'], ConfigureBakerFlowState> &
    WithAccountInfo;

export default function AmountPage({ initial, onNext, formValues, accountInfo }: AmountPageProps) {
    const { chainParameters } = useContext(earnPageContext);
    const [openWarning, setOpenWarning] = useState<AmountWarning>(AmountWarning.None);
    const { t } = useTranslation('account', { keyPrefix: 'baking.configure' });
    const { t: tShared } = useTranslation('shared');
    const { setDetailsExpanded } = useContext(accountPageContext);

    const form = useForm<AmountPageForm>({
        defaultValues: initial === undefined ? { amount: '' } : { amount: initial },
    });
    const amount = form.watch('amount');
    const isBaker = isBakerAccount(accountInfo);

    const cost = useMemo(() => {
        const energyCost = isBaker ? getCost(accountInfo, formValues, amount) : getConfigureBakerMaxEnergyCost();
        return chainParameters ? convertEnergyToMicroCcd(energyCost, chainParameters).microCcdAmount : 0n;
    }, [chainParameters, amount]);

    const minCost = useMemo(() => {
        if (isBaker) {
            // min Cost only needed when we are registering a baker
            return 0n;
        }
        return chainParameters
            ? convertEnergyToMicroCcd(getFullConfigureBakerMinEnergyCost(), chainParameters).microCcdAmount
            : 0n;
    }, [chainParameters, isBaker]);

    const validateAmount: Validate<string> = (amountToValidate) =>
        validateBakerStake(amountToValidate, chainParameters, accountInfo, cost);

    useEffect(() => {
        setDetailsExpanded(true);
        return () => setDetailsExpanded(false);
    }, []);

    const pendingChange = isBaker && accountInfo.accountBaker.pendingChange?.change !== undefined;

    const onSubmit = (vs: AmountPageForm) => {
        const stake = ccdToMicroCcd(vs.amount);
        // If the default value i.e. current stake or previosly chosen stake is already above the threshold, do not display the warning
        if (
            !(initial && isAboveStakeWarningThreshold(ccdToMicroCcd(initial), accountInfo)) &&
            isAboveStakeWarningThreshold(stake, accountInfo)
        ) {
            setOpenWarning(AmountWarning.AboveThreshold);
        } else if (isBaker && accountInfo.accountBaker.stakedAmount.microCcdAmount > stake) {
            setOpenWarning(AmountWarning.Decrease);
        } else {
            onNext(vs.amount);
        }
    };

    return (
        <Form<AmountPageForm> className="configure-flow-form" formMethods={form} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div className="w-full">
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
                        <p className="m-t-0 text-center">{t('amount.description')}</p>
                        {pendingChange && (
                            <DisabledAmountInput label={t('amount.locked')} note={t('amount.lockedNote')} />
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
                        <div className="earn__cost">
                            <p className="m-t-0">
                                {tShared('estimatedTransactionFee')}: {isBaker && displayAsCcd(cost)}
                                {!isBaker && `\n${displayAsCcd(minCost)} - ${displayAsCcd(cost)}`}
                            </p>
                        </div>
                    </div>
                    <Submit className="m-t-20" width="wide">
                        {tShared('continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
