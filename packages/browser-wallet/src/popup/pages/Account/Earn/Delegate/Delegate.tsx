/* eslint-disable react/destructuring-assignment */
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
    AccountInfoDelegator,
    AccountTransactionType,
    DelegationTargetType,
    isDelegatorAccount,
} from '@concordium/web-sdk';
import { displayAsCcd, noOp } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';

import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { ensureDefined } from '@shared/utils/basic-helpers';
import Button from '@popup/shared/Button';
import { removePendingTransactionAtom, selectedPendingTransactionsAtom } from '@popup/store/transactions';
import LoadingIcon from '@assets/svg/pending-arrows.svg';
import { BrowserWalletAccountTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import RegisterDelegation from './RegisterDelegation';

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
    const removePendingTransaction = useSetAtom(removePendingTransactionAtom);

    useEffect(() => {
        if (transaction.status === TransactionStatus.Failed) {
            return () => {
                removePendingTransaction(transaction.transactionHash);
            };
        }

        return noOp;
    }, [transaction.status]);

    return (
        <div className="flex-column align-center justify-center h-full">
            {transaction.status === TransactionStatus.Pending && <LoadingIcon className="loading" />}
            <h3 className="m-t-5 m-b-0 m-h-30 text-center">
                {transaction.status === TransactionStatus.Pending && t('pending')}
                {transaction.status === TransactionStatus.Failed && t('failed')}
            </h3>
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
            <div>
                <div className="label label--faded">{sharedT('amount')}</div>
                <div className="text-mono">{displayAsCcd(accountInfo.accountDelegation.stakedAmount)}</div>
                <div className="label label--faded m-t-10">{sharedT('target')}</div>
                <div>
                    {accountInfo.accountDelegation.delegationTarget.delegateType === DelegationTargetType.Baker
                        ? sharedT('targetBaker', {
                              bakerId: accountInfo.accountDelegation.delegationTarget.bakerId.toString(),
                          })
                        : sharedT('targetPassive')}
                </div>
                <div className="label label--faded m-t-10">{sharedT('redelegate')}</div>
                <div>
                    {accountInfo.accountDelegation.restakeEarnings
                        ? sharedT('redelegateOption')
                        : sharedT('noRedelegateOption')}
                </div>
                {/* TODO: display pending changes */}
            </div>
            <div className="m-t-20 text-center">
                <Button danger width="wide">
                    {t('stopDelegation')}
                </Button>
                <Button className="m-t-10" width="wide">
                    {t('updateDelegation')}
                </Button>
            </div>
        </div>
    );
}

export default function Delegate() {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected to find account info for selected account');
    const delegateTransaction = [...useAtomValue(selectedPendingTransactionsAtom)]
        .reverse()
        .find((t) => t.type === AccountTransactionType.ConfigureDelegation);

    let details;
    if (isDelegatorAccount(accountInfo)) {
        details = <DelegationDetails accountInfo={accountInfo} />;
    } else if (delegateTransaction !== undefined) {
        details = <PendingDelegation transaction={delegateTransaction} />;
    }

    return (
        <Routes>
            <Route index element={details ?? <Navigate replace to={routes.register} />} />
            <Route path={`${routes.register}/*`} element={<RegisterDelegation />} />
        </Routes>
    );
}
