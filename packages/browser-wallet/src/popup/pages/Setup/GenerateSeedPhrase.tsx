import PageHeader from '@popup/shared/PageHeader';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { TextArea as ControlledTextArea } from '@popup/shared/Form/TextArea';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { encryptedSeedPhraseAtom, sessionOnboardingLocationAtom } from '@popup/store/settings';
import { decrypt, encrypt } from '@popup/shared/crypto';
import { setupRoutes } from './routes';
import { usePasscodeInSetup } from './passcode-helper';

export default function GenerateSeedPhrase() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation('setup');
    const [seedPhrase, setSeedPhrase] = useState<string>();
    const [encryptedSeedPhrase, setEncryptedSeedPhrase] = useAtom(encryptedSeedPhraseAtom);
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const passcode = usePasscodeInSetup();

    useEffect(() => {
        if (!encryptedSeedPhrase.loading && encryptedSeedPhrase.value === undefined && passcode) {
            const newSeedPhrase = generateMnemonic(wordlist, 256);
            encrypt(newSeedPhrase, passcode).then((newEncryptedSeedPhrase) => {
                setEncryptedSeedPhrase(newEncryptedSeedPhrase);
                setSeedPhrase(newSeedPhrase);
                setOnboardingLocation(location.pathname);
            });
        }
    }, [encryptedSeedPhrase.loading, encryptedSeedPhrase.value, passcode]);

    useEffect(() => {
        if (!seedPhrase && !encryptedSeedPhrase.loading && encryptedSeedPhrase.value && passcode) {
            decrypt(encryptedSeedPhrase.value, passcode).then(setSeedPhrase);
        }
    }, [seedPhrase, encryptedSeedPhrase.loading, encryptedSeedPhrase.value, passcode]);

    return (
        <>
            <PageHeader canGoBack backTo={`${absoluteRoutes.setup.path}/${setupRoutes.createOrRestore}`}>
                {t('recoveryPhrase.title')}
            </PageHeader>
            <div className="onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">{t('recoveryPhrase.description')}</div>
                <div className="p-10">
                    <ControlledTextArea value={seedPhrase} readOnly />
                </div>
                <Button
                    className="onboarding-setup__page-with-header__continue-button"
                    width="medium"
                    onClick={() => navigate(`${absoluteRoutes.setup.path}/${setupRoutes.enterRecoveryPhrase}`)}
                >
                    {t('continue')}
                </Button>
            </div>
        </>
    );
}
