import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import Logo from '@assets/svg/concordium.svg';
import Toast from '@popup/shared/Toast/Toast';

import { useCredential } from '@popup/shared/utils/account-helpers';
import AccountDetails from '@popup/pages/Account/AccountDetails';
import AccountInfoListenerContext from '@popup/shared/AccountInfoListenerContext';
import BlockChainParametersContext from '@popup/shared/BlockChainParametersProvider';

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

    return (
        <>
            <Header />
            <div className="external-request-layout">
                <AccountInfoListenerContext>
                    <BlockChainParametersContext>
                        {account && <AccountDetails expanded={false} account={account} />}
                        <main className="external-request-layout__main">{children}</main>
                        <Toast />
                    </BlockChainParametersContext>
                </AccountInfoListenerContext>
            </div>
        </>
    );
}
