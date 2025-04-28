import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import clsx from 'clsx';

import { absoluteRoutes } from '@popup/constants/routes';
import { absoluteRoutes as absoluteRoutesX } from '@popup/popupX/constants/routes';
import { hasBeenOnBoardedAtom, sessionPasscodeAtom, acceptedTermsAtom } from '@popup/store/settings';
import { isRecoveringAtom } from '@popup/store/identity';
import Toast from '@popup/shared/Toast/Toast';
import Header from './Header';

export default function MainLayout() {
    const [headerOpen, setHeaderOpen] = useState(false);
    const { loading: loadingHasBeenOnboarded, value: hasBeenOnboarded } = useAtomValue(hasBeenOnBoardedAtom);
    const { loading: loadingPasscode, value: sessionPasscode } = useAtomValue(sessionPasscodeAtom);
    const { loading: loadingIsRecovering, value: sessionIsRecovering } = useAtomValue(isRecoveringAtom);
    const { loading: loadingAcceptedTerms, value: acceptedTerms } = useAtomValue(acceptedTermsAtom);

    if (loadingHasBeenOnboarded || loadingPasscode || loadingIsRecovering || loadingAcceptedTerms) {
        // This will be near instant, as we're just waiting for the Chrome async store
        return null;
    }

    if (!hasBeenOnboarded) {
        return <Navigate to={absoluteRoutesX.onboarding.path} />;
    }

    if (!sessionPasscode) {
        return <Navigate to={absoluteRoutes.login.path} state={{ to: absoluteRoutes.home.account.path }} />;
    }

    if (!acceptedTerms || !acceptedTerms.accepted) {
        return <Navigate to={absoluteRoutes.termsAndConditions.path} />;
    }

    if (sessionIsRecovering) {
        return <Navigate to={absoluteRoutes.recovery.path} />;
    }

    return (
        <div className="main-layout">
            <Header onToggle={setHeaderOpen} />
            <main className={clsx('main-layout__main', headerOpen && 'main-layout__main--blur')}>
                <Outlet />
            </main>
            <Toast />
        </div>
    );
}
