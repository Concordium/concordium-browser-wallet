import React, { createContext, useCallback, useMemo, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import { jsonRpcUrlAtom } from '@popup/store/settings';
import { noOp } from '@shared/utils/basic-helpers';
import Header from './Header';

type MainLayoutContextValue = {
    reset(): void;
    onPageDropdownToggle?(handler: (open: boolean) => void): void;
};

const initial: MainLayoutContextValue = { reset: noOp };
const mainLayoutContext = createContext(initial);

export default function MainLayout() {
    const jsonRpcUrl = useAtomValue(jsonRpcUrlAtom);
    const [togglePageDropdownHandler, setHandler] = useState<(open: boolean) => void>();
    const reset = useCallback(() => {
        setHandler(undefined);
    }, []);

    const contextValue = useMemo(() => ({ reset, onPageDropdownToggle: setHandler }), [reset, setHandler]);

    if (!jsonRpcUrl) {
        // Force user to go through setup
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    return (
        <mainLayoutContext.Provider value={contextValue}>
            <div className="main-layout">
                <Header onTogglePageDropdown={togglePageDropdownHandler} />
                <main className="main-layout__main">
                    <Outlet />
                </main>
            </div>
        </mainLayoutContext.Provider>
    );
}
