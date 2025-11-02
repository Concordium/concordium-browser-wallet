import React, { useCallback, useEffect } from 'react';
import FormPassword from '@popup/popupX/shared/Form/Password';
import Form from '@popup/popupX/shared/Form/Form';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useAtom, useSetAtom } from 'jotai';
import { passcodeAtom } from '@popup/state';
import { useForm } from '@popup/shared/Form';
import { SubmitHandler, Validate } from 'react-hook-form';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';

type FormValues = {
    passcode: string;
    passcodeAgain: string;
};

export default function SetupPassword() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.setupPassword' });
    const nav = useNavigate();
    const navToNext = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.path);
    const setPasscode = useSetAtom(passcodeAtom);
    const setPasscodeInSession = useSetAtom(sessionPasscodeAtom);
    const [, setEncryptedSeedPhrase] = useAtom(encryptedSeedPhraseAtom);
    const form = useForm<FormValues>();
    const passcode = form.watch('passcode');

    const handleSubmit: SubmitHandler<FormValues> = (vs) => {
        setPasscode(vs.passcode);
        setPasscodeInSession(vs.passcode);
        setEncryptedSeedPhrase(undefined);
        navToNext();
    };

    const passcodesAreEqual: Validate<string> = useCallback(
        (value) => value === passcode || t('passcodeMismatch'),
        [passcode]
    );

    useEffect(() => {
        if (form.formState.dirtyFields.passcodeAgain) {
            form.trigger('passcodeAgain');
        }
    }, [passcode]);

    return (
        <Page className="setup-password">
            <Page.Main>
                <div className="setup-password__title">
                    <span className="concordium-logo-white" />
                    <Text.Heading>{t('setPassword')}</Text.Heading>
                    <Text.MainRegular>{t('firstStep')}</Text.MainRegular>
                </div>
                <Form
                    id="setup-password-form"
                    onSubmit={handleSubmit}
                    formMethods={form}
                    className="setup-password__form"
                >
                    {(f) => {
                        return (
                            <>
                                <FormPassword
                                    autoFocus
                                    control={f.control}
                                    showStrength
                                    name="passcode"
                                    label={t('enterPasscode')}
                                    rules={{
                                        required: t('passcodeRequired'),
                                        minLength: { value: 6, message: t('passcodeMinLength') },
                                    }}
                                />
                                <FormPassword
                                    control={f.control}
                                    name="passcodeAgain"
                                    label={t('enterPasscodeAgain')}
                                    rules={{ validate: passcodesAreEqual }}
                                />
                            </>
                        );
                    }}
                </Form>
            </Page.Main>
            <Page.Footer>
                <Button.Main form="setup-password-form" type="submit" label={t('continue')} onClick={() => {}} />
            </Page.Footer>
        </Page>
    );
}
