import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import TextArea from '@popup/shared/Form/TextArea';
import { passcodeAtom, seedPhraseAtom } from '@popup/state';
import { useAtomValue, useSetAtom } from 'jotai';
import Form from '@popup/shared/Form';
import { SubmitHandler, Validate } from 'react-hook-form';
import Submit from '@popup/shared/Form/Submit';
import { useTranslation } from 'react-i18next';
import { encrypt } from '@popup/shared/crypto';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { setupRoutes } from './routes';

type FormValues = {
    seedPhraseInput: string;
};

export function EnterRecoveryPhrase() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const seedPhrase = useAtomValue(seedPhraseAtom);
    const setEncryptedSeedPhrase = useSetAtom(encryptedSeedPhraseAtom);
    const setPasscodeInSession = useSetAtom(sessionPasscodeAtom);
    const passcode = useAtomValue(passcodeAtom);

    if (!passcode) {
        // This page should not be shown without the passcode in state.
        return null;
    }

    const handleSubmit: SubmitHandler<FormValues> = (vs) => {
        const encryptedSeedPhrase = encrypt(vs.seedPhraseInput, passcode);
        setEncryptedSeedPhrase(encryptedSeedPhrase);
        setPasscodeInSession(passcode);
        navigate(`${absoluteRoutes.setup.path}/${setupRoutes.chooseNetwork}`);
    };

    function validateSeedPhrase(): Validate<string> {
        return (seedPhraseValue) => (seedPhraseValue !== seedPhrase ? t('enterRecoveryPhrase.form.error') : undefined);
    }

    return (
        <>
            <PageHeader canGoBack>Your recovery phrase</PageHeader>
            <div className="onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">
                    {t('enterRecoveryPhrase.description')}
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
                                    />
                                    <Submit
                                        className="onboarding-setup__page-with-header__continue-button"
                                        width="narrow"
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
