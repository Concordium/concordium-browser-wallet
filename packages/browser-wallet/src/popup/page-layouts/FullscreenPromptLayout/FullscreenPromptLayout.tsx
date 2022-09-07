import React, { createContext, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { noOp } from 'wallet-common-helpers';
import { absoluteRoutes } from '@popup/constants/routes';
import Logo from '@assets/svg/concordium.svg';
import Toast from '@popup/shared/Toast/Toast';

import { isSpawnedWindow } from '@popup/shared/window-helpers';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import AccountDetails from '@popup/pages/Account/AccountDetails';
import AccountContext from '@popup/pages/Account/AccountContext';

type OnCloseHandler = () => void;
type Unsubscribe = () => void;

type OnClose = (handler: OnCloseHandler) => Unsubscribe;
type WithClose = <A extends unknown[], F extends (...args: A) => void>(action: F) => (...args: A) => void;

type FullscreenPromptContext = {
    onClose: OnClose;
    /**
     * Generate an action, that also closes the prompt.
     */
    withClose: WithClose;
};

const defaultContext: FullscreenPromptContext = {
    onClose: () => noOp,
    withClose: () => noOp,
};

export const fullscreenPromptContext = createContext<FullscreenPromptContext>(defaultContext);

function useNavigateBack() {
    const nav = useNavigate();

    return () => nav(-1);
}

function Header() {
    const { t } = useTranslation('mainLayout');
    const { pathname } = useLocation();

    function getHeaderTitle() {
        if (pathname.startsWith(absoluteRoutes.prompt.endIdentityIssuance.path)) {
            return t('header.ids');
        }
        if (pathname.startsWith(absoluteRoutes.prompt.connectionRequest.path)) {
            return t('header.connect');
        }
        return t('header.request');
    }

    return (
        <header className="main-layout-header">
            <div className="main-layout-header__bar">
                <div className="main-layout-header__logo">
                    <Logo />
                </div>
                <label className="main-layout-header__title">
                    <h1 className="relative flex align-center">{getHeaderTitle()}</h1>
                </label>
            </div>
        </header>
    );
}

export default function FullscreenPromptLayout() {
    const goBack = useNavigateBack();

    const closeHandler = useRef<OnCloseHandler>();
    const close = useCallback(() => {
        closeHandler?.current?.();

        if (isSpawnedWindow) {
            window.close();
        } else {
            goBack();
        }
    }, []);

    const withClose: WithClose = useCallback(
        (action) =>
            (...args) => {
                action(...args);
                close();
            },
        [close]
    );

    const onClose: OnClose = useCallback((handler) => {
        closeHandler.current = handler;

        return () => {
            closeHandler.current = undefined;
        };
    }, []);

    const contextValue: FullscreenPromptContext = useMemo(() => ({ onClose, withClose }), [onClose, withClose]);

    const account = useSelectedCredential();

    return (
        <fullscreenPromptContext.Provider value={contextValue}>
            <Header />
            <div className="fullscreen-prompt-layout">
                <AccountContext account={account}>
                    {account && <AccountDetails expanded={false} account={account} />}
                    <main className="fullscreen-prompt-layout__main">
                        <Outlet />
                    </main>
                    <Toast />
                </AccountContext>
            </div>
        </fullscreenPromptContext.Provider>
    );
}
