import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import clsx from 'clsx';

import { absoluteRoutes } from '@popup/constants/routes';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import Toast from '@popup/shared/Toast/Toast';
import Header from './Header';

export default function MainLayout() {
    const [headerOpen, setHeaderOpen] = useState(false);
    const { loading: loadingEncryptedSeedPhrase, value: encryptedSeedPhrase } = useAtomValue(encryptedSeedPhraseAtom);
    const { loading: loadingPasscode, value: sessionPasscode } = useAtomValue(sessionPasscodeAtom);

    if (loadingEncryptedSeedPhrase || loadingPasscode) {
        // This will be near instant, as we're just waiting for the Chrome async store
        return null;
    }

    if (!encryptedSeedPhrase) {
        // The user has not been unboarded, and hence have not generated a seed phrase yet.
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    if (!sessionPasscode) {
        return <Navigate to={absoluteRoutes.login.path} />;
    }

    return (
        <div className="main-layout">
            <Header className="main-layout__header" onToggle={setHeaderOpen} />
            <main className={clsx('main-layout__main', headerOpen && 'main-layout__main--blur')}>
                <Outlet />
            </main>
            <Toast />
        </div>
    );
}
