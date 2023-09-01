import React from 'react';
import Logo from '@assets/svg/concordium.svg';
import ConcordiumLetters from '@assets/svg/concordium-letters.svg';
import { SubmitHandler, useForm } from 'react-hook-form';
import Form from '@popup/shared/Form';
import Submit from '@popup/shared/Form/Submit';
import FormPassword from '@popup/shared/Form/Password';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import { decrypt } from '@shared/utils/crypto';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';

type FormValues = {
    passcode: string;
};

type State = {
    to: string;
    // This is actually just any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toState: any;
};

/**
 * Will navigate to the to address in the location's state, after unlocking
 */
export default function Login() {
    const navigate = useNavigate();
    const state = useLocation().state as State;
    const setPasscodeInSession = useSetAtom(sessionPasscodeAtom);
    const encryptedSeedPhrase = useAtomValue(encryptedSeedPhraseAtom);
    const { t } = useTranslation('login');
    const { t: tSetup } = useTranslation('setup');
    const form = useForm<FormValues>();

    if (!encryptedSeedPhrase) {
        return null;
    }

    const handleSubmit: SubmitHandler<FormValues> = async (vs) => {
        if (encryptedSeedPhrase.value) {
            try {
                await decrypt(encryptedSeedPhrase.value, vs.passcode);
                // If decryption did not throw an error, then the password is correct.
                setPasscodeInSession(vs.passcode);
                navigate(state.to, { state: state.toState });
            } catch {
                form.setError('passcode', { message: t('incorrectPasscode') });
            }
        }
    };

    return (
        <div className="onboarding-setup__intro-wrapper">
            <div className="onboarding-setup__intro-wrapper__logos">
                <Logo className="onboarding-setup__intro-wrapper__logo" />
                <ConcordiumLetters className="age-request__concordium-letters" />
            </div>
            <p className="login__description">{t('description')}</p>
            <Form onSubmit={handleSubmit} className="login__form" formMethods={form}>
                {(f) => {
                    return (
                        <>
                            <FormPassword
                                autoFocus
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
