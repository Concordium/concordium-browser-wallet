import React, { useContext, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateTransfer from './CreateTransfer';
import ConfirmSimpleTransfer from './ConfirmSimpleTransfer';
import { routes } from './routes';
import ConfirmTokenTransfer from './ConfirmTokenTransfer';
import { accountPageContext } from '../utils';

export default function SendCcd() {
    const [cost, setCost] = useState(0n);
    const { setDetailsExpanded } = useContext(accountPageContext);

    return (
        <Routes>
            <Route
                path={routes.confirm}
                element={<ConfirmSimpleTransfer setDetailsExpanded={setDetailsExpanded} cost={cost} />}
            />
            <Route
                path={routes.confirmToken}
                element={<ConfirmTokenTransfer setDetailsExpanded={setDetailsExpanded} cost={cost} />}
            />
            <Route
                index
                element={<CreateTransfer setCost={setCost} cost={cost} setDetailsExpanded={setDetailsExpanded} />}
            />
        </Routes>
    );
}
