import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AccountInfo, isBakerAccount, OpenStatus } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import { getCcdSymbol, isValidCcdString, ccdToMicroCcd } from 'wallet-common-helpers';
import { Validate } from 'react-hook-form';

import Form, { useForm } from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import FormAmountInput from '@popup/shared/Form/AmountInput';
import { validateBakerStake } from '@popup/shared/utils/transaction-helpers';
import { getConfigureBakerEnergyCost } from '@shared/utils/energy-helpers';
import { WithAccountInfo } from '@popup/shared/utils/account-helpers';
import { accountPageContext } from '@popup/pages/Account/utils';
import DisabledAmountInput from '@popup/shared/DisabledAmountInput';
import { earnPageContext, isAboveStakeWarningThreshold, STAKE_WARNING_THRESHOLD } from '../../utils';
import { configureBakerChangesPayload, ConfigureBakerFlowState } from '../utils';
import { AmountWarning, WarningModal } from '../../Warning';

function getCost(accountInfo: AccountInfo, formValues: Partial<ConfigureBakerFlowState>, amount: string) {
    const formValuesFull = {
        restake: formValues.restake || true,
        openForDelegation: formValues.openForDelegation || OpenStatus.ClosedForAll,
        metadataUrl: formValues.metadataUrl || '',
        commissionRates: formValues.commissionRates || {
            transactionCommission: 0,
            bakingCommission: 0,
            finalizationCommission: 0,
        },
        keys: formValues.keys || null,
        amount: isValidCcdString(amount) ? amount : '0',
    };
    return getConfigureBakerEnergyCost(configureBakerChangesPayload(accountInfo)(formValuesFull));
}

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

    const cost = useMemo(() => getCost(accountInfo, formValues, amount), [amount]);

    const validateAmount: Validate<string> = (amountToValidate) =>
        validateBakerStake(amountToValidate, chainParameters, accountInfo, cost);

    useEffect(() => {
        setDetailsExpanded(true);
        return () => setDetailsExpanded(false);
    }, []);

    const pendingChange = isBakerAccount(accountInfo) && accountInfo.accountBaker.pendingChange?.change !== undefined;

    const onSubmit = (vs: AmountPageForm) => {
        const stake = ccdToMicroCcd(vs.amount);
        // If the default value i.e. current stake or previosly chosen stake is already above the threshold, do not display the warning
        if (
            !(initial && isAboveStakeWarningThreshold(ccdToMicroCcd(initial), accountInfo)) &&
            isAboveStakeWarningThreshold(stake, accountInfo)
        ) {
            setOpenWarning(AmountWarning.AboveThreshold);
        } else if (isBakerAccount(accountInfo) && accountInfo.accountBaker.stakedAmount > stake) {
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
                    </div>
                    <Submit className="m-t-20" width="wide">
                        {tShared('continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
