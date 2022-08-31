import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { SimpleTransferPayload } from '@concordium/web-sdk';
import { getSimpleTransferCost } from '@popup/shared/utils/wallet-proxy';
import { noOp, useAsyncMemo } from 'wallet-common-helpers';
import CreateTransfer from './CreateTransfer';
import ConfirmTransfer from './ConfirmTransfer';
import { routes } from './routes';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
}

export default function SendCcd({ setDetailsExpanded }: Props) {
    const [payload, setPayload] = useState<SimpleTransferPayload>();
    const cost = useAsyncMemo(getSimpleTransferCost, noOp, []);

    return (
        <Routes>
            <Route index element={<Navigate to={routes.create} />} />
            <Route
                path={routes.confirm}
                element={<ConfirmTransfer payload={payload} setDetailsExpanded={setDetailsExpanded} cost={cost} />}
            />
            <Route
                path={routes.create}
                element={<CreateTransfer setPayload={setPayload} defaultPayload={payload} cost={cost} />}
            />
        </Routes>
    );
}
