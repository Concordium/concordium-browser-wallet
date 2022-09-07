import React from 'react';
import Logo from '@assets/svg/concordium.svg';
import ConcordiumLetters from '@assets/svg/concordium-letters.svg';
import { SubmitHandler, useForm } from 'react-hook-form';
import Form from '@popup/shared/Form';
import Submit from '@popup/shared/Form/Submit';
import FormPassword from '@popup/shared/Form/Password';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { decrypt } from '@popup/shared/crypto';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

type FormValues = {
    passcode: string;
};

export default function Login({ navigateTo }: { navigateTo?: string }) {
    const navigate = useNavigate();
    const setPasscodeInSession = useSetAtom(sessionPasscodeAtom);
    const encryptedSeedPhrase = useAtomValue(encryptedSeedPhraseAtom);
    const { t } = useTranslation('login');
    const { t: tSetup } = useTranslation('setup');
    const form = useForm<FormValues>();

    if (!encryptedSeedPhrase) {
        return null;
    }

    const handleSubmit: SubmitHandler<FormValues> = (vs) => {
        if (encryptedSeedPhrase.value) {
            try {
                const decryptedSeedPhrase = decrypt(encryptedSeedPhrase.value, vs.passcode);

                // TODO Replace this with an authenticated encryption scheme (AES-GCM). This is a dirty way of validating the decryption.
                if (validateMnemonic(decryptedSeedPhrase, wordlist)) {
                    setPasscodeInSession(vs.passcode);
                    if (navigateTo) {
                        navigate(navigateTo);
                    }
                } else {
                    form.setError('passcode', { message: t('incorrectPasscode') });
                }
            } catch {
                form.setError('passcode', { message: t('incorrectPasscode') });
            }
        }
    };

    return (
        <div className="onboarding-setup__intro-wrapper">
            <div className="onboarding-setup__intro-wrapper__logos">
                <Logo className="onboarding-setup__intro-wrapper__logo" />
                <ConcordiumLetters className="onboarding-setup__intro-wrapper__concordium-letters" />
            </div>
            <p className="login__description">{t('description')}</p>
            <Form onSubmit={handleSubmit} className="login__form" formMethods={form}>
                {(f) => {
                    return (
                        <>
                            <FormPassword
                                control={f.control}
                                name="passcode"
                                label={tSetup('setupPasscode.form.enterPasscode')}
                                rules={{
                                    required: tSetup('setupPasscode.form.passcodeRequired'),
                                }}
                            />
                            <Submit className="onboarding-setup__intro-wrapper__continue-button" width="medium">
                                {t('unlock')}
                            </Submit>
                        </>
                    );
                }}
            </Form>
        </div>
    );
}
