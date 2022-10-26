import React, { useContext, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { accountPageContext } from '../utils';

const routes = {
    update: 'update',
    details: 'details',
};
function SpecifyContract() {
    return <>Specify contract...</>;
}

function UpdateTokens() {
    return <>Update tokens...</>;
}

function TokenDetails() {
    return <>Token details...</>;
}

export default function AddTokens() {
    const { setDetailsExpanded } = useContext(accountPageContext);

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    return (
        <Routes>
            <Route index element={<SpecifyContract />} />
            <Route path={routes.update} element={<UpdateTokens />} />
            <Route path={routes.details} element={<TokenDetails />} />
        </Routes>
    );
}
