import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { isDelegatorAccount } from '@concordium/web-sdk';

import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { ensureDefined } from '@shared/utils/basic-helpers';
import RegisterDelegation from './RegisterDelegation';

const routes = {
    register: 'register',
    update: 'update',
    remove: 'remove',
};

export default function Delegate() {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected to find account info for selected account');

    return (
        <Routes>
            <Route
                index
                element={
                    isDelegatorAccount(accountInfo) ? <>Delegation view</> : <Navigate replace to={routes.register} />
                }
            />
            <Route path={`${routes.register}/*`} element={<RegisterDelegation />} />
        </Routes>
    );
}
