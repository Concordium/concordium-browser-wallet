import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AccountAddress, GtuAmount, SimpleTransferPayload } from '@concordium/web-sdk';
import CreateTransfer from './CreateTransfer';
import ConfirmTransfer from './ConfirmTransfer';
import { routes } from './routes';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
}

export default function DisplayAddress({ setDetailsExpanded }: Props) {
    const [payload, setPayload] = useState<SimpleTransferPayload>({
        amount: new GtuAmount(1n),
        toAddress: new AccountAddress('4LvxSUkrS4u84etWT8H8fvknMQxb1GLm6u5qpkbZp7rwaCHP52'),
    });

    return (
        <Routes>
            <Route index element={<Navigate to={routes.create} />} />
            <Route
                path={routes.confirm}
                element={<ConfirmTransfer payload={payload} setDetailsExpanded={setDetailsExpanded} />}
            />
            <Route path={routes.create} element={<CreateTransfer setPayload={setPayload} defaultPayload={payload} />} />
        </Routes>
    );
}
