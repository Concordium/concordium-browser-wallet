import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AccountInfoDelegator, DelegationTargetType, isDelegatorAccount } from '@concordium/web-sdk';

import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { displayAsCcd } from 'wallet-common-helpers';
import RegisterDelegation from './RegisterDelegation';

const routes = {
    register: 'register',
    update: 'update',
    remove: 'remove',
};

type DelegationDetailsProps = {
    accountInfo: AccountInfoDelegator;
};

function DelegationDetails({ accountInfo }: DelegationDetailsProps) {
    return (
        <div>
            <h3>##Delegation target:</h3>
            <div>
                {accountInfo.accountDelegation.delegationTarget.delegateType === DelegationTargetType.Baker
                    ? accountInfo.accountDelegation.delegationTarget.bakerId.toString()
                    : '##Passive delegation'}
            </div>
            <h3>##Delegation amount:</h3>
            <div>{displayAsCcd(accountInfo.accountDelegation.stakedAmount)}</div>
            <h3>##Restake earnings:</h3>
            <div>{accountInfo.accountDelegation.restakeEarnings ? '##Yes' : '##No'}</div>
            {/* TODO: display pending changes */}
        </div>
    );
}

export default function Delegate() {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected to find account info for selected account');

    return (
        <Routes>
            <Route
                index
                element={
                    isDelegatorAccount(accountInfo) ? (
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
