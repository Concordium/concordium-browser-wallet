import React, { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import PageHeader from '@popup/shared/PageHeader';
import Button from '@popup/shared/Button';
import { useTranslation } from 'react-i18next';
import { encryptedSeedPhraseAtom, sessionOnboardingLocationAtom } from '@popup/store/settings';
import { setupRoutes } from './routes';

export default function CreateOrRestore() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const setEncryptedSeedPhrase = useSetAtom(encryptedSeedPhraseAtom);

    useEffect(() => {
        setOnboardingLocation(undefined);
        setEncryptedSeedPhrase(undefined);
    }, []);

    return (
        <>
            <PageHeader>Create or restore</PageHeader>
            <div className="onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">{t('createRestore.description')}</div>
                <Button
                    className="onboarding-setup__page-with-header__create-restore-button"
                    width="wide"
                    onClick={() => navigate(`${absoluteRoutes.setup.path}/${setupRoutes.createNew}`)}
                >
                    {t('createRestore.create')}
                </Button>
                <Button
                    className="onboarding-setup__page-with-header__create-restore-button"
                    width="wide"
                    onClick={() => {
                        navigate(`${absoluteRoutes.setup.path}/${setupRoutes.restore}`);
                    }}
                >
                    {t('createRestore.restore')}
                </Button>
            </div>
        </>
    );
}
