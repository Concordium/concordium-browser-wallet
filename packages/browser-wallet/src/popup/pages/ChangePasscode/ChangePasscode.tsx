import { decrypt, encrypt } from '@shared/utils/crypto';
import Form, { useForm } from '@popup/shared/Form';
import FormPassword from '@popup/shared/Form/Password';
import Submit from '@popup/shared/Form/Submit';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { useAtom, useSetAtom } from 'jotai';
import React from 'react';
import { SubmitHandler, UseFormGetValues, Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import { addToastAtom } from '@popup/state';

type FormValues = {
    currentPasscode: string;
    newPasscode: string;
    newPasscodeRepeated: string;
};

export default function ChangePasscode() {
    const nav = useNavigate();
    const { t: tSetup } = useTranslation('setup');
    const { t } = useTranslation('changePasscode');
    const form = useForm<FormValues>();
    const [encryptedSeedPhrase, setEncryptedSeedPhrase] = useAtom(encryptedSeedPhraseAtom);
    const [passcode, setPasscode] = useAtom(sessionPasscodeAtom);
    const addToast = useSetAtom(addToastAtom);

    if (passcode.loading || !passcode.value || encryptedSeedPhrase.loading) {
        return null;
    }

    const handleSubmit: SubmitHandler<FormValues> = async (vs) => {
        if (encryptedSeedPhrase.value && passcode.value) {
            const decryptedSeedPhrase = await decrypt(encryptedSeedPhrase.value, passcode.value);
            const encryptedSeedPhraseWithNewPasscode = await encrypt(decryptedSeedPhrase, vs.newPasscode);

            setEncryptedSeedPhrase(encryptedSeedPhraseWithNewPasscode);
            setPasscode(vs.newPasscode);
            addToast(t('passcodeUpdated'));

            nav(absoluteRoutes.home.settings.path);
        }
    };

    function validateCurrentPasscode(): Validate<string> {
        return (currentPasscode) => (currentPasscode !== passcode.value ? t('incorrectPasscode') : undefined);
    }

    function validateNewPasscode(getValues: UseFormGetValues<FormValues>): Validate<string> {
        return (newPasscodeRepeated) =>
            getValues().newPasscode !== newPasscodeRepeated ? tSetup('setupPasscode.form.passcodeMismatch') : undefined;
    }

    return (
        <div className="change-passcode-page">
            <Form onSubmit={handleSubmit} className="change-passcode-page__form" formMethods={form}>
                {(f) => {
                    return (
                        <>
                            <FormPassword
                                control={f.control}
                                name="currentPasscode"
                                label={t('labels.currentPasscode')}
                                className="m-b-20"
                                rules={{
                                    required: tSetup('setupPasscode.form.passcodeRequired'),
                                    validate: validateCurrentPasscode(),
                                }}
                            />
                            <FormPassword
                                control={f.control}
                                name="newPasscode"
                                label={t('labels.newPasscode')}
                                rules={{
                                    required: tSetup('setupPasscode.form.passcodeRequired'),
                                    minLength: { value: 6, message: tSetup('setupPasscode.form.passcodeMinLength') },
                                }}
                            />
                            <FormPassword
                                control={f.control}
                                name="newPasscodeRepeated"
                                label={t('labels.newPasscodeRepeated')}
                                className="m-t-10"
                                rules={{ validate: validateNewPasscode(f.getValues) }}
                            />
                            <Submit
                                className="change-passcode-page__button"
                                width="medium"
                                disabled={f.formState.isSubmitting}
                            >
                                {t('changePasscode')}
                            </Submit>
                        </>
                    );
                }}
            </Form>
        </div>
    );
}
