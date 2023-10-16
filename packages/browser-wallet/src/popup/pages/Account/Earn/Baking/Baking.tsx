/* eslint-disable react/destructuring-assignment */
import React, { useContext, useEffect, useMemo } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import {
    AccountTransactionType,
    ConsensusStatus,
    StakePendingChange,
    StakePendingChangeType,
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
import CheckmarkIcon from '@assets/svg/logo-checkmark.svg';
import { selectedPendingTransactionsAtom } from '@popup/store/transactions';
import LoadingIcon from '@assets/svg/pending-arrows.svg';
import { BrowserWalletAccountTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import ButtonGroup from '@popup/shared/ButtonGroup';
import { openStatusToDisplay } from '@popup/shared/utils/baking-helpers';
import DisplayPartialString from '@popup/shared/DisplayPartialString';
import RegisterBaking from './RegisterBaking';
import RemoveBaking from './RemoveBaking';
import UpdateBaking from './UpdateBaking';
import { earnPageContext } from '../utils';

const routes = {
    register: 'register',
    update: 'update',
    remove: 'remove',
};

type PendingBakingProps = {
    transaction: BrowserWalletAccountTransaction;
};

function PendingBaking({ transaction }: PendingBakingProps): JSX.Element {
    const { t } = useTranslation('account', { keyPrefix: 'baking.details' });

    return (
        <div className="flex-column align-center justify-center h-full">
            {transaction.status !== TransactionStatus.Failed && <LoadingIcon className="loading" />}
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
    const { t: sharedT } = useTranslation('shared', { keyPrefix: 'baking' });
    const { consensusStatus, tokenomicsInfo, chainParameters } = useContext(earnPageContext);

    const effectiveTime = useMemo(() => {
        if (pendingChange) {
            // TODO fix type assertion
            const date = dateFromStakePendingChange(
                pendingChange,
                consensusStatus as ConsensusStatus,
                tokenomicsInfo,
                chainParameters
            );
            if (date) {
                return getFormattedDateString(date);
            }
        }
        return undefined;
    }, [
        (pendingChange as StakePendingChange)?.effectiveTime?.toString?.(),
        consensusStatus,
        tokenomicsInfo,
        chainParameters,
    ]);

    if (!pendingChange?.change) {
        return null;
    }

    return (
        <>
            <div className="earn-details__header">{sharedT('changesTakesEffectOn', { effectiveTime })}</div>
            {pendingChange?.change === StakePendingChangeType.ReduceStake && (
                <>
                    <div className="earn-details__header">{sharedT('pendingChange')}</div>
                    <div className="earn-details__value">{displayAsCcd(pendingChange.newStake)} </div>
                </>
            )}
            {pendingChange?.change === StakePendingChangeType.RemoveStakeV1 && (
                <div className="earn-details__value">{sharedT('pendingRemove')}</div>
            )}
        </>
    );
}

type BakingDetailsProps = {
    accountInfo: AccountInfoBakerV1;
};

function BakingDetails({ accountInfo }: BakingDetailsProps) {
    const { t } = useTranslation('account', { keyPrefix: 'baking.details' });
    const { t: sharedT } = useTranslation('shared', { keyPrefix: 'baking' });
    const { metadataUrl } = accountInfo.accountBaker.bakerPoolInfo;

    return (
        <div className="earn-details">
            <div className="earn-details__card">
                <div className="flex align-center justify-center">
                    <CheckmarkIcon className="earn-details__logo m-r-10" />
                    <h3 className="earn-details__title m-v-0 m-r-20">{t('heading')}</h3>
                </div>
                <div className="earn-details__header">{sharedT('amount')}</div>
                <div className="earn-details__value">{displayAsCcd(accountInfo.accountBaker.stakedAmount)}</div>
                <div className="earn-details__header">{sharedT('bakerId')}</div>
                <div className="earn-details__value">{accountInfo.accountBaker.bakerId.toString()}</div>
                <div className="earn-details__header">{sharedT('restake')}</div>
                <div className="earn-details__value">
                    {accountInfo.accountBaker.restakeEarnings ? sharedT('restakeOption') : sharedT('noRestakeOption')}
                </div>
                <div className="earn-details__header">{sharedT('openForDelegation')}</div>
                <div className="earn-details__value">
                    {openStatusToDisplay(accountInfo.accountBaker.bakerPoolInfo.openStatus)}
                </div>
                {metadataUrl && (
                    <>
                        <div className="earn-details__header">{sharedT('metadataUrl')}</div>
                        <DisplayPartialString className="earn-details__value word-break-all" value={metadataUrl} />
                    </>
                )}
                <DisplayPendingChange pendingChange={accountInfo.accountBaker.pendingChange} />
            </div>
            <div className="m-10 m-b-0 text-center">
                <ButtonGroup>
                    {accountInfo.accountBaker.pendingChange !== undefined ? (
                        <Button disabled>{t('stop')}</Button>
                    ) : (
                        <Button danger as={Link} to={routes.remove}>
                            {t('stop')}
                        </Button>
                    )}
                    <Button as={Link} to={routes.update}>
                        {t('update')}
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    );
}

function BakingStatus() {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected to find account info for selected account');
    const transaction = [...useAtomValue(selectedPendingTransactionsAtom)]
        .reverse()
        .find((t) => t.type === AccountTransactionType.ConfigureBaker);
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
        if (!isBakerAccountV1(accountInfo) && !hasUpdate && isFirstRender) {
            nav(routes.register, { replace: true });
        }
    }, []);

    if (isBakerAccountV1(accountInfo)) {
        return <BakingDetails accountInfo={accountInfo} />;
    }
    if (hasUpdate && transaction) {
        return <PendingBaking transaction={transaction} />;
    }
    return null;
}

export default function Baking() {
    return (
        <Routes>
            <Route index element={<BakingStatus />} />
            <Route path={`${routes.register}/*`} element={<RegisterBaking />} />
            <Route path={`${routes.remove}/*`} element={<RemoveBaking />} />
            <Route path={`${routes.update}/*`} element={<UpdateBaking />} />
        </Routes>
    );
}
