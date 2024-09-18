/* eslint-disable react/destructuring-assignment */
import React, { useContext, useEffect, useMemo } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import {
    AccountInfoDelegator,
    AccountTransactionType,
    ConsensusStatusV0,
    DelegationTargetType,
    isDelegatorAccount,
    StakePendingChangeType,
    StakePendingChange,
} from '@concordium/web-sdk';
import {
    dateFromStakePendingChange,
    displayAsCcd,
    getFormattedDateString,
    useIsSubsequentRender,
} from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { ensureDefined } from '@shared/utils/basic-helpers';
import Button from '@popup/shared/Button';
import { selectedPendingTransactionsAtom } from '@popup/store/transactions';
import PendingIcon from '@assets/svg/logo-pending.svg';
import CheckmarkIcon from '@assets/svg/logo-checkmark.svg';
import { BrowserWalletAccountTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import ButtonGroup from '@popup/shared/ButtonGroup';
import { msToTimeRemain } from '@shared/utils/time-helpers';
import RegisterDelegation from './RegisterDelegation';
import UpdateDelegation from './UpdateDelegation';
import RemoveDelegation from './RemoveDelegation';
import { earnPageContext } from '../utils';

const routes = {
    register: 'register',
    update: 'update',
    remove: 'remove',
};

type PendingDelegationProps = {
    transaction: BrowserWalletAccountTransaction;
};

function PendingDelegation({ transaction }: PendingDelegationProps): JSX.Element {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.details' });

    return (
        <div className="flex-column align-center justify-center h-full">
            {transaction.status !== TransactionStatus.Failed && <PendingIcon className="earn-details__logo" />}
            <h3 className="m-t-5 m-b-0 m-h-30 text-center">
                {t(transaction.status === TransactionStatus.Failed ? 'failed' : 'pending')}
            </h3>
        </div>
    );
}

type DisplayPendingChangeProps = {
    pendingChange?: StakePendingChange;
};

function DisplayPendingChange({ pendingChange }: DisplayPendingChangeProps) {
    const { consensusStatus, tokenomicsInfo, chainParameters } = useContext(earnPageContext);

    const effectiveTime = useMemo(() => {
        if (pendingChange) {
            // TODO fix type assertion
            const date = dateFromStakePendingChange(
                pendingChange,
                consensusStatus as ConsensusStatusV0,
                tokenomicsInfo,
                chainParameters
            );
            if (date) {
                return getFormattedDateString(date);
            }
        }
        return undefined;
    }, [pendingChange?.effectiveTime?.toString(), consensusStatus, tokenomicsInfo, chainParameters]);

    const { t: sharedT } = useTranslation('shared', { keyPrefix: 'delegation' });
    if (pendingChange?.change === StakePendingChangeType.ReduceStake) {
        return (
            <>
                <div className="earn-details__header">{sharedT('changesTakesEffectOn', { effectiveTime })}</div>
                <div className="earn-details__header">{sharedT('pendingChange')}</div>
                <div className="earn-details__value">{displayAsCcd(pendingChange.newStake)} </div>
            </>
        );
    }
    if (pendingChange?.change === StakePendingChangeType.RemoveStake) {
        return (
            <>
                <div className="earn-details__header">{sharedT('changesTakesEffectOn', { effectiveTime })}</div>
                <div className="earn-details__value">{sharedT('pendingRemove')}</div>
            </>
        );
    }
    return null;
}

function DisplayCooldowns({ accountInfo }: DelegationDetailsProps) {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.cooldowns' });

    return (
        <div className="earn-details__coldowns">
            {accountInfo.accountCooldowns.map((accountCooldown) => {
                const { time, unit } = msToTimeRemain(accountCooldown.timestamp.value);

                // i18n unable to type check dynamic strings
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const timeLocale = t('time.valueRemain', { value: t(`time.${unit}`, { count: Number(time) }) });

                return (
                    <div
                        key={accountCooldown.timestamp.value.toString()}
                        className="coldown-card flex-column align-center justify-center"
                    >
                        <div className="coldown-card__header">{t('inactiveStake')}</div>
                        <div className="coldown-card__info-text">{t('cooldownInfo')}</div>
                        <div className="earn-details__value">{displayAsCcd(accountCooldown.amount.microCcdAmount)}</div>
                        <div className="coldown-card__time flex">
                            <span className="coldown-card__info-text">{t('cooldownTime')}</span>
                            <span className="coldown-card__value">{time.toString()}</span>
                            <span className="coldown-card__info-text">{timeLocale}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

type DelegationDetailsProps = {
    accountInfo: AccountInfoDelegator;
};

function DelegationDetails({ accountInfo }: DelegationDetailsProps) {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.details' });
    const { t: sharedT } = useTranslation('shared', { keyPrefix: 'delegation' });

    return (
        <div className="earn-details">
            <div className="earn-details__card">
                <div className="flex align-center justify-center">
                    <CheckmarkIcon className="earn-details__logo m-r-10" />
                    <h3 className="earn-details__title m-v-0 m-r-20">{t('heading')}</h3>
                </div>
                <div className="earn-details__header">{sharedT('amount')}</div>
                <div className="earn-details__value">
                    {displayAsCcd(accountInfo.accountDelegation.stakedAmount.microCcdAmount)}
                </div>
                <div className="earn-details__header">{sharedT('target')}</div>
                <div className="earn-details__value">
                    {accountInfo.accountDelegation.delegationTarget.delegateType === DelegationTargetType.Baker
                        ? sharedT('targetBaker', {
                              bakerId: accountInfo.accountDelegation.delegationTarget.bakerId.toString(),
                          })
                        : sharedT('targetPassive')}
                </div>
                <div className="earn-details__header">{sharedT('redelegate')}</div>
                <div className="earn-details__value">
                    {accountInfo.accountDelegation.restakeEarnings
                        ? sharedT('redelegateOption')
                        : sharedT('noRedelegateOption')}
                </div>
                <DisplayPendingChange pendingChange={accountInfo.accountDelegation.pendingChange} />
            </div>
            <DisplayCooldowns accountInfo={accountInfo} />
            <div className="m-10 m-b-0 text-center">
                <ButtonGroup>
                    {accountInfo.accountDelegation.pendingChange !== undefined ? (
                        <Button disabled>{t('stopDelegation')}</Button>
                    ) : (
                        <Button danger as={Link} to={routes.remove}>
                            {t('stopDelegation')}
                        </Button>
                    )}
                    <Button as={Link} to={routes.update}>
                        {t('updateDelegation')}
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    );
}

function DelegationStatus() {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected to find account info for selected account');
    const transaction = [...useAtomValue(selectedPendingTransactionsAtom)]
        .reverse()
        .find((t) => t.type === AccountTransactionType.ConfigureDelegation);
    const isFirstRender = !useIsSubsequentRender();
    const transactionStatusUpdate = useMemo(
        () => (isFirstRender ? undefined : transaction?.status),
        [transaction?.status]
    );
    const nav = useNavigate();

    const hasUpdate = useMemo(
        () =>
            transaction !== undefined &&
            (transaction?.status === TransactionStatus.Pending || transactionStatusUpdate !== undefined),
        [transaction, transactionStatusUpdate]
    );

    useEffect(() => {
        if (!isDelegatorAccount(accountInfo) && !hasUpdate && isFirstRender) {
            nav(routes.register, { replace: true });
        }
    }, []);

    if (isDelegatorAccount(accountInfo)) {
        return <DelegationDetails accountInfo={accountInfo} />;
    }
    if (hasUpdate && transaction) {
        return <PendingDelegation transaction={transaction} />;
    }
    return null;
}

export default function Delegate() {
    return (
        <Routes>
            <Route index element={<DelegationStatus />} />
            <Route path={`${routes.register}/*`} element={<RegisterDelegation />} />
            <Route path={`${routes.remove}/*`} element={<RemoveDelegation />} />
            <Route path={`${routes.update}/*`} element={<UpdateDelegation />} />
        </Routes>
    );
}
