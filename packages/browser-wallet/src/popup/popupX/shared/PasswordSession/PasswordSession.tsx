import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, useForm } from 'react-hook-form';
import { acceptedActivityTrackingAtom, encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { decrypt } from '@shared/utils/crypto';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Form from '@popup/popupX/shared/Form/Form';
import FormPassword from '@popup/popupX/shared/Form/Password';
import Button from '@popup/popupX/shared/Button';

type FormValues = {
    passcode: string;
};

export default function PasswordSession() {
    const setPasscodeInSession = useSetAtom(sessionPasscodeAtom);
    const encryptedSeedPhrase = useAtomValue(encryptedSeedPhraseAtom);
    const [activityTracking, setActivityTracking] = useAtom(acceptedActivityTrackingAtom);
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.passwordSession' });
    const { t: tPasscode } = useTranslation('x', { keyPrefix: 'sharedX.form.password' });
    const form = useForm<FormValues>();

    if (!encryptedSeedPhrase) {
        return null;
    }

    const handleSubmit: SubmitHandler<FormValues> = async (vs) => {
        if (activityTracking.value) {
            setActivityTracking({ ...activityTracking.value, sessionId: Math.floor(Date.now() / 1000) });
        }
        if (encryptedSeedPhrase.value) {
            try {
                await decrypt(encryptedSeedPhrase.value, vs.passcode);
                // If decryption did not throw an error, then the password is correct.
                setPasscodeInSession(vs.passcode);
            } catch {
                form.setError('passcode', { message: tPasscode('incorrectPasscode') });
            }
        }
    };

    return (
        <div className="main-layout-x">
            <Page className="session-password-x">
                <Page.Main>
                    <span className="concordium-logo-white" />
                    <Text.MainRegular>{t('enterPassword')}</Text.MainRegular>
                    <Form id="session-password-form" onSubmit={handleSubmit} formMethods={form}>
                        {(f) => {
                            return (
                                <FormPassword
                                    control={f.control}
                                    name="passcode"
                                    label={tPasscode('currentPasscode')}
                                    className="m-t-10"
                                    rules={{
                                        required: tPasscode('passcodeRequired'),
                                    }}
                                />
                            );
                        }}
                    </Form>
                </Page.Main>
                <Page.Footer>
                    <Button.Main
                        form="session-password-form"
                        type="submit"
                        label={t('unlock')}
                        disabled={form.formState.isSubmitting}
                    />
                </Page.Footer>
            </Page>
        </div>
    );
}
