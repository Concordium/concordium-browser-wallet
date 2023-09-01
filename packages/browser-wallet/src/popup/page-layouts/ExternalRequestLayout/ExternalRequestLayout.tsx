import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import Logo from '@assets/svg/concordium.svg';
import Toast from '@popup/shared/Toast/Toast';

import { useCredential } from '@popup/shared/utils/account-helpers';
import AccountDetails from '@popup/pages/Account/AccountDetails';
import { useAtomValue } from 'jotai';
import { sessionPasscodeAtom } from '@popup/store/settings';

function Header() {
    const { t } = useTranslation('mainLayout');
    const { pathname } = useLocation();

    function getHeaderTitle() {
        if (pathname.startsWith(absoluteRoutes.prompt.connectionRequest.path)) {
            return t('header.connect');
        }
        if (pathname.startsWith(absoluteRoutes.prompt.addTokens.path)) {
            return t('header.addTokens');
        }
        if (pathname.startsWith(absoluteRoutes.prompt.idProof.path)) {
            return t('header.idProof');
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
    children: ReactNode;
}

export default function ExternalRequestLayout({ children }: Props) {
    const { state } = useLocation() as Location;
    const account = useCredential(state.payload.accountAddress);
    const { loading: loadingPasscode, value: sessionPasscode } = useAtomValue(sessionPasscodeAtom);

    if (loadingPasscode) {
        // This will be near instant, as we're just waiting for the Chrome async store
        return null;
    }

    if (!sessionPasscode) {
        return <Navigate to={absoluteRoutes.login.path} state={{ to: -1 }} />;
    }

    return (
        <>
            <Header />
            <div className="external-request-layout">
                {account && <AccountDetails expanded={false} account={account} />}
                <main className="external-request-layout__main">{children}</main>
                <Toast />
            </div>
        </>
    );
}
