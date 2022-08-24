import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import TextArea from '@popup/shared/Form/TextArea';
import { passcodeAtom } from '@popup/state';
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

const validateSeedPhraseLength =
    (message: string): Validate<string> =>
    (seedPhrase) =>
        seedPhrase.split(/\s+/).length !== 24 ? message : true;

export default function EnterRecoveryPhrase() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
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

    return (
        <>
            <PageHeader>Restore your wallet</PageHeader>
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
                                            validate: {
                                                checkLength: validateSeedPhraseLength(
                                                    t('enterRecoveryPhrase.seedPhrase.length')
                                                ),
                                            },
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
