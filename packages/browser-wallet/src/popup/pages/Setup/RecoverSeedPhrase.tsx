import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import TextArea from '@popup/shared/Form/TextArea';
import { useSetAtom } from 'jotai';
import Form from '@popup/shared/Form';
import { SubmitHandler, Validate } from 'react-hook-form';
import Submit from '@popup/shared/Form/Submit';
import { useTranslation } from 'react-i18next';
import { encrypt } from '@shared/utils/crypto';
import { encryptedSeedPhraseAtom, sessionOnboardingLocationAtom } from '@popup/store/settings';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { setupRoutes } from './routes';
import { usePasscodeInSetup } from './passcode-helper';

type FormValues = {
    seedPhraseInput: string;
};

const validateSeedPhrase =
    (message: string): Validate<string> =>
    (seedPhrase) =>
        validateMnemonic(seedPhrase, wordlist) ? true : message;

export default function RecoverSeedPhrase() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const setEncryptedSeedPhrase = useSetAtom(encryptedSeedPhraseAtom);
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const passcode = usePasscodeInSetup();

    if (!passcode) {
        // This page should not be shown without the passcode in state.
        return null;
    }

    const handleSubmit: SubmitHandler<FormValues> = async (vs) => {
        const encryptedSeedPhrase = await encrypt(vs.seedPhraseInput, passcode);
        setEncryptedSeedPhrase(encryptedSeedPhrase);
        const chooseNetworkPathRecovering = `${absoluteRoutes.setup.path}/${setupRoutes.chooseNetwork}/recovering`;
        setOnboardingLocation(chooseNetworkPathRecovering);
        navigate(chooseNetworkPathRecovering);
    };

    return (
        <>
            <PageHeader canGoBack>{t('recoverSeedPhrase.title')}</PageHeader>
            <div className="onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">
                    {t('confirmRecoveryPhrase.description')}
                </div>
                <div className="p-10">
                    <Form<FormValues> onSubmit={handleSubmit}>
                        {(f) => {
                            return (
                                <>
                                    <TextArea
                                        register={f.register}
                                        name="seedPhraseInput"
                                        rules={{
                                            required: t('enterRecoveryPhrase.seedPhrase.required'),
                                            validate: validateSeedPhrase(t('enterRecoveryPhrase.seedPhrase.validate')),
                                        }}
                                    />
                                    <Submit
                                        className="onboarding-setup__page-with-header__continue-button"
                                        width="medium"
                                    >
                                        {t('continue')}
                                    </Submit>
                                </>
                            );
                        }}
                    </Form>
                </div>
            </div>
        </>
    );
}
