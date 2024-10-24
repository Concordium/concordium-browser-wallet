import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { DelegatorIntro } from './Intro';
import TransactionFlow from './TransactionFlow';

const routes = {
    configure: 'configure',
};

export default function RegisterDelegator() {
    return (
        <Routes>
            <Route index element={<DelegatorIntro onDoneRoute={routes.configure} />} />
            <Route path={`${routes.configure}/*`} element={<TransactionFlow />} />
        </Routes>
    );
}
