import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Logo from '@assets/svg/concordium.svg';
import ConcordiumLetters from '@assets/svg/concordium-letters.svg';
import Button from '@popup/shared/Button';
import { useTranslation } from 'react-i18next';
import { setupRoutes } from './routes';
import { EnterRecoveryPhrase } from './RecoveryPhrase';
import { ChooseNetwork } from './ChooseNetwork';
import SetupPasscode from './SetupPasscode';
import CreateOrRestore from './CreateOrRestore';
import GenerateSeedPhrase from './GenerateSeedPhrase';

function Intro() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');

    return (
        <div className="onboarding-setup__intro-wrapper">
            <div className="onboarding-setup__intro-wrapper__logos">
                <Logo className="onboarding-setup__intro-wrapper__logo" />
                <ConcordiumLetters className="onboarding-setup__intro-wrapper__concordium-letters" />
            </div>
            <div className="onboarding-setup__intro-wrapper__description">
                <p>{t('intro.welcome')}</p>
                <p>{t('intro.description')}</p>
            </div>
            <Button
                className="onboarding-setup__intro-wrapper__continue-button"
                width="narrow"
                onClick={() => navigate(setupRoutes.passcode)}
            >
                {t('continue')}
            </Button>
        </div>
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
            <Route path={setupRoutes.chooseNetwork} element={<ChooseNetwork />} />
            <Route path={setupRoutes.restore} element={<CreateOrRestore />} />
        </Routes>
    );
}
