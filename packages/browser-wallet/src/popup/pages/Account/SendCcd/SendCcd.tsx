import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { getSimpleTransferCost } from '@popup/shared/utils/wallet-proxy';
import { noOp, useAsyncMemo } from 'wallet-common-helpers';
import CreateTransfer from './CreateTransfer';
import ConfirmTransfer from './ConfirmTransfer';
import { routes } from './routes';
import ConfirmTokenTransfer from './ConfirmTokenTransfer';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
}

export default function SendCcd({ setDetailsExpanded }: Props) {
    const cost = useAsyncMemo(getSimpleTransferCost, noOp, []);

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
            <Route index element={<CreateTransfer cost={cost} />} />
        </Routes>
    );
}
