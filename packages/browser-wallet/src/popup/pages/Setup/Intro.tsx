import React from 'react';
import Logo from '@assets/svg/concordium.svg';
import ConcordiumLetters from '@assets/svg/concordium-letters.svg';
import Button from '@popup/shared/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setupRoutes } from './routes';

export default function Intro() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');

    return (
        <div className="intro">
            <div className="intro__logos">
                <Logo className="intro__logo" />
                <ConcordiumLetters className="intro__concordium-letters" />
            </div>
            <div className="intro__text">
                <p>{t('intro.welcome')}</p>
                <p>{t('intro.description')}</p>
            </div>
            <Button className="intro__button" width="narrow" onClick={() => navigate(setupRoutes.passcode)}>
                {t('continue')}
            </Button>
        </div>
    );
}
