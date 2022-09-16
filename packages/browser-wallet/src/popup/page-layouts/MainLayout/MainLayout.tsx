import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import clsx from 'clsx';

import { absoluteRoutes } from '@popup/constants/routes';
import { hasBeenOnBoardedAtom, sessionOnboardingLocationAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { isRecoveringAtom } from '@popup/store/identity';
import Toast from '@popup/shared/Toast/Toast';
import AccountInfoListenerContext from '@popup/shared/AccountInfoListenerContext';
import Header from './Header';

export default function MainLayout() {
    const [headerOpen, setHeaderOpen] = useState(false);
    const { loading: loadingHasBeenOnboarded, value: hasBeenOnboarded } = useAtomValue(hasBeenOnBoardedAtom);
    const { loading: loadingOnboardingLocation, value: onboardingLocation } =
        useAtomValue(sessionOnboardingLocationAtom);
    const { loading: loadingPasscode, value: sessionPasscode } = useAtomValue(sessionPasscodeAtom);
    const { loading: loadingIsRecovering, value: sessionIsRecovering } = useAtomValue(isRecoveringAtom);

    if (loadingHasBeenOnboarded || loadingPasscode || loadingIsRecovering || loadingOnboardingLocation) {
        // This will be near instant, as we're just waiting for the Chrome async store
        return null;
    }

    if (!hasBeenOnboarded) {
        if (onboardingLocation) {
            return <Navigate to={absoluteRoutes.login.path} state={{ to: onboardingLocation }} />;
        }
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    if (!sessionPasscode) {
        return <Navigate to={absoluteRoutes.login.path} state={{ to: absoluteRoutes.home.account.path }} />;
    }

    if (sessionIsRecovering) {
        return <Navigate to={absoluteRoutes.recovery.path} />;
    }

    return (
        <div className="main-layout">
            <AccountInfoListenerContext>
                <Header className="main-layout__header" onToggle={setHeaderOpen} />
                <main className={clsx('main-layout__main', headerOpen && 'main-layout__main--blur')}>
                    <Outlet />
                </main>
            </AccountInfoListenerContext>
            <Toast />
        </div>
    );
}
