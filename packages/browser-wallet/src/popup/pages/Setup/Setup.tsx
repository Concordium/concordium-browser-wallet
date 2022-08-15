import React from 'react';
import { useNavigate, Route, Routes } from 'react-router-dom';

import { absoluteRoutes } from '@popup/constants/routes';
import PageHeader from '@popup/shared/PageHeader';
import Button from '@popup/shared/Button';
import Intro from './Intro';
import { setupRoutes } from './routes';
import { CreateNewWallet, EnterRecoveryPhrase } from './RecoveryPhrase';
import { ChooseNetwork } from './ChooseNetwork';
import SetupPasscode from './SetupPasscode';

function CreateOrRestore() {
    const navigate = useNavigate();

    return (
        <>
            <PageHeader>Create or restore</PageHeader>
            <div className="p-10">
                <p>You now have the option create a new wallet or restore an existing one.</p>
                <p>How do you want to proceed?</p>
            </div>
            <div className="intro__create-or-restore">
                <Button
                    className="intro__button"
                    width="narrow"
                    onClick={() => navigate(`${absoluteRoutes.setup.path}/${setupRoutes.createNew}`)}
                >
                    Create
                </Button>
                <Button
                    className="intro__button"
                    width="narrow"
                    onClick={() => navigate(`${absoluteRoutes.setup.path}/${setupRoutes.restore}`)}
                >
                    Restore
                </Button>
            </div>
        </>
    );
}

export default function SetupRoutes() {
    return (
        <Routes>
            <Route index element={<Intro />} />
            <Route path={setupRoutes.passcode} element={<SetupPasscode />} />
            <Route path={setupRoutes.createOrRestore} element={<CreateOrRestore />} />
            <Route path={setupRoutes.createNew} element={<CreateNewWallet />} />
            <Route path={setupRoutes.enterRecoveryPhrase} element={<EnterRecoveryPhrase />} />
            <Route path={setupRoutes.chooseNetwork} element={<ChooseNetwork />} />
            <Route path={setupRoutes.restore} element={<CreateOrRestore />} />
        </Routes>
    );
}
