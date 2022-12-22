import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AccountInfo, AccountTransactionType, DelegationTargetType, isDelegatorAccount } from '@concordium/web-sdk';
import { displayAsCcd } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { ensureDefined } from '@shared/utils/basic-helpers';
import Button from '@popup/shared/Button';
import { selectedPendingTransactionsAtom } from '@popup/store/transactions';
import LoadingIcon from '@assets/svg/pending-arrows.svg';
import RegisterDelegation from './RegisterDelegation';

const routes = {
    register: 'register',
    update: 'update',
    remove: 'remove',
};

type DelegationDetailsProps = {
    accountInfo: AccountInfo;
};

function DelegationDetails({ accountInfo }: DelegationDetailsProps) {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.details' });
    const { t: sharedT } = useTranslation('shared', { keyPrefix: 'delegation' });

    if (!isDelegatorAccount(accountInfo)) {
        return (
            <div className="flex-column align-center justify-center h-full">
                <LoadingIcon className="loading" />
                <h3 className="m-t-5 m-b-0 m-h-30 text-center">{t('pending')}</h3>
            </div>
        );
    }

    return (
        <div className="earn-details">
            <div>
                <h3 className="m-t-0 earn-details__heading">{sharedT('amount')}</h3>
                <div className="text-mono">{displayAsCcd(accountInfo.accountDelegation.stakedAmount)}</div>
                <h3 className="earn-details__heading">{sharedT('target')}</h3>
                <div>
                    {accountInfo.accountDelegation.delegationTarget.delegateType === DelegationTargetType.Baker
                        ? sharedT('targetBaker', {
                              bakerId: accountInfo.accountDelegation.delegationTarget.bakerId.toString(),
                          })
                        : sharedT('targetPassive')}
                </div>
                <h3 className="earn-details__heading">{sharedT('redelegate')}</h3>
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
    const hasPendingDelegateTransaction = useAtomValue(selectedPendingTransactionsAtom).some(
        (t) => t.type === AccountTransactionType.ConfigureDelegation
    );

    return (
        <Routes>
            <Route
                index
                element={
                    isDelegatorAccount(accountInfo) || hasPendingDelegateTransaction ? (
                        <DelegationDetails accountInfo={accountInfo} />
                    ) : (
                        <Navigate replace to={routes.register} />
                    )
                }
            />
            <Route path={`${routes.register}/*`} element={<RegisterDelegation />} />
        </Routes>
    );
}
