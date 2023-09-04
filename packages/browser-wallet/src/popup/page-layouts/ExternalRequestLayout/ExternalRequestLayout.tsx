import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import Logo from '@assets/svg/concordium.svg';
import Toast from '@popup/shared/Toast/Toast';

import { useCredential } from '@popup/shared/utils/account-helpers';
import AccountDetails from '@popup/pages/Account/AccountDetails';
import clsx from 'clsx';
import { ClassName } from 'wallet-common-helpers';

function Header() {
    const { t } = useTranslation('mainLayout');
    const { pathname } = useLocation();

    function getHeaderTitle() {
        if (pathname.startsWith(absoluteRoutes.prompt.connectionRequest.path)) {
            return t('header.connect');
        }
        if (pathname.startsWith(absoluteRoutes.prompt.connectAccountsRequest.path)) {
            return t('header.allowlistingRequest');
        }
        if (pathname.startsWith(absoluteRoutes.prompt.addTokens.path)) {
            return t('header.addTokens');
        }
        if (pathname.startsWith(absoluteRoutes.prompt.addWeb3IdCredential.path)) {
            return t('header.addWeb3IdCredential');
        }
        if (pathname.startsWith(absoluteRoutes.prompt.idProof.path)) {
            return t('header.idProof');
        }
        if (pathname.startsWith(absoluteRoutes.prompt.web3IdProof.path)) {
            return t('header.web3IdProof');
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

interface Location {
    state: {
        payload: {
            accountAddress: string;
        };
    };
}

interface Props {
    children?: ReactNode;
}

export default function ExternalRequestLayout({ children, className }: Props & ClassName) {
    const { state } = useLocation() as Location;
    const account = useCredential(state.payload.accountAddress);

    return (
        <>
            <Header />
            <div className="external-request-layout">
                {account && <AccountDetails expanded={false} account={account} />}
                <main className={clsx('external-request-layout__main', !account && 'h-full', className)}>
                    {children}
                </main>
                <Toast />
            </div>
        </>
    );
}
