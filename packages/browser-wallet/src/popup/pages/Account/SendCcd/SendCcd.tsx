import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { getEnergyPerCCD } from '@popup/shared/utils/wallet-proxy';
import { noOp, useAsyncMemo } from 'wallet-common-helpers';
import CreateTransfer from './CreateTransfer';
import ConfirmTransfer from './ConfirmTransfer';
import { routes } from './routes';
import ConfirmTokenTransfer from './ConfirmTokenTransfer';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
}

export default function SendCcd({ setDetailsExpanded }: Props) {
    const exchangeRate = useAsyncMemo(getEnergyPerCCD, noOp, []);
    const [cost, setCost] = useState(0n);

    return (
        <Routes>
            <Route
                path={routes.confirm}
                element={<ConfirmTransfer setDetailsExpanded={setDetailsExpanded} cost={cost} />}
            />
            <Route
                path={routes.confirmToken}
                element={<ConfirmTokenTransfer setDetailsExpanded={setDetailsExpanded} cost={cost} />}
            />
            <Route index element={<CreateTransfer exchangeRate={exchangeRate} setCost={setCost} />} />
        </Routes>
    );
}
