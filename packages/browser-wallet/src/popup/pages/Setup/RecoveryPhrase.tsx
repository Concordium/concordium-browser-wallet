import PageHeader from '@popup/shared/PageHeader';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import TextArea from '@popup/shared/Form/TextArea';
import { useAtomValue, useSetAtom } from 'jotai';
import Form from '@popup/shared/Form';
import { SubmitHandler, Validate } from 'react-hook-form';
import Submit from '@popup/shared/Form/Submit';
import { useTranslation } from 'react-i18next';
import { decrypt } from '@popup/shared/crypto';
import { encryptedSeedPhraseAtom, sessionOnboardingLocationAtom } from '@popup/store/settings';
import { setupRoutes } from './routes';
import { usePasscodeInSetup } from './passcode-helper';

type FormValues = {
    seedPhraseInput: string;
};

export function EnterRecoveryPhrase() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const passcode = usePasscodeInSetup();
    const encryptedSeedPhrase = useAtomValue(encryptedSeedPhraseAtom);
    const [seedPhrase, setSeedPhrase] = useState<string>();
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);

    useEffect(() => {
        if (!encryptedSeedPhrase.loading && encryptedSeedPhrase.value && passcode) {
            decrypt(encryptedSeedPhrase.value, passcode).then(setSeedPhrase);
        }
    }, [encryptedSeedPhrase.loading, encryptedSeedPhrase.value, passcode]);

    if (!passcode || encryptedSeedPhrase.loading || !encryptedSeedPhrase.value) {
        // This page should not be shown without the passcode or encrypted seed phrase in state.
        return null;
    }

    const handleSubmit: SubmitHandler<FormValues> = () => {
        const chooseNetworkPath = `${absoluteRoutes.setup.path}/${setupRoutes.chooseNetwork}`;
        setOnboardingLocation(chooseNetworkPath);
        navigate(chooseNetworkPath);
    };

    function validateSeedPhrase(): Validate<string> {
        return (seedPhraseValue) => (seedPhraseValue !== seedPhrase ? t('enterRecoveryPhrase.form.error') : undefined);
    }

    return (
        <>
            <PageHeader canGoBack>{t('recoveryPhrase.title')}</PageHeader>
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
                                            required: t('enterRecoveryPhrase.form.required'),
                                            validate: validateSeedPhrase(),
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            return false;
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
