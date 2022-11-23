import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PerformRecovery from '@popup/pages/Recovery/RecoveryMain';
import { setupRoutes } from './routes';
import { EnterRecoveryPhrase } from './RecoveryPhrase';
import { ChooseNetwork } from './ChooseNetwork';
import SetupPasscode from './SetupPasscode';
import CreateOrRestore from './CreateOrRestore';
import GenerateSeedPhrase from './GenerateSeedPhrase';
import RestoreRecoveryPhrase from './RecoverSeedPhrase';
import AcceptTerms from '../TermsAndConditions/AcceptTerms';

function Intro() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');

    return (
        <AcceptTerms onSubmit={() => navigate(setupRoutes.passcode)}>
            <p>{t('intro.welcome')}</p>
            <p>{t('intro.description')}</p>
        </AcceptTerms>
    );
}

export default function SetupRoutes() {
    return (
        <Routes>
            <Route index element={<Intro />} />
            <Route path={setupRoutes.passcode} element={<SetupPasscode />} />
            <Route path={setupRoutes.createOrRestore} element={<CreateOrRestore />} />
            <Route path={setupRoutes.createNew} element={<GenerateSeedPhrase />} />
            <Route path={setupRoutes.enterRecoveryPhrase} element={<EnterRecoveryPhrase />} />
            <Route path={setupRoutes.restore} element={<RestoreRecoveryPhrase />} />
            <Route path={setupRoutes.performRecovery} element={<PerformRecovery />} />
            <Route path={setupRoutes.chooseNetwork} element={<ChooseNetwork />} />
            <Route path={`${setupRoutes.chooseNetwork}/recovering`} element={<ChooseNetwork />} />
        </Routes>
    );
}
