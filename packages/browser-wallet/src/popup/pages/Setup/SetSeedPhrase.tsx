import PageHeader from '@popup/shared/PageHeader';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { TextArea as ControlledTextArea } from '@popup/shared/Form/TextArea';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { encryptedSeedPhraseAtom, sessionOnboardingLocationAtom } from '@popup/store/settings';
import { encrypt } from '@shared/utils/crypto';
import { setupRoutes } from './routes';
import { usePasscodeInSetup } from './passcode-helper';

export default function SetSeedPhrase() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const [seedPhrase, setSeedPhrase] = useState<string>();
    const setEncryptedSeedPhrase = useSetAtom(encryptedSeedPhraseAtom);
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const passcode = usePasscodeInSetup();
    const [error, setError] = useState<string>();

    useEffect(() => {
        setOnboardingLocation(undefined);
    }, []);

    function whenClicked() {
        if (seedPhrase !== undefined && passcode !== undefined) {
            encrypt(seedPhrase, passcode).then((newEncryptedSeedPhrase) => {
                setEncryptedSeedPhrase(newEncryptedSeedPhrase);

                const chooseNetworkPath = `${absoluteRoutes.setup.path}/${setupRoutes.chooseNetwork}`;
                setOnboardingLocation(chooseNetworkPath);
                navigate(chooseNetworkPath);
            });
        }
    }

    return (
        <>
            <PageHeader canGoBack backTo={`${absoluteRoutes.setup.path}/${setupRoutes.createOrRestore}`}>
                {t('recoveryPhrase.title')}
            </PageHeader>
            <div className="onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">
                    Input a seed phrase generated from an external source.
                </div>
                <div className="p-10">
                    <ControlledTextArea
                        value={seedPhrase}
                        error={error}
                        onChange={(e) => {
                            setSeedPhrase(e.target.value);
                            if (validateMnemonic(e.target.value, wordlist)) {
                                setError(undefined);
                            } else {
                                setError('The seed phrase is invalid');
                            }
                        }}
                    />
                </div>
                <Button
                    className="onboarding-setup__page-with-header__continue-button"
                    width="medium"
                    onClick={() => whenClicked()}
                    disabled={seedPhrase === undefined || error !== undefined}
                >
                    {t('continue')}
                </Button>
            </div>
        </>
    );
}
