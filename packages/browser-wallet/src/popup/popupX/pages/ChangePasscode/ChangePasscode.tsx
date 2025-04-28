import React, { useRef } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Button from '@popup/popupX/shared/Button';
import FormPassword from '@popup/popupX/shared/Form/Password';
import Form, { useForm } from '@popup/popupX/shared/Form/Form';
import { useAtom, useSetAtom } from 'jotai';
import { encryptedSeedPhraseAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { SubmitHandler, UseFormGetValues, Validate } from 'react-hook-form';
import { decrypt, encrypt } from '@shared/utils/crypto';

type FormValues = {
    currentPasscode: string;
    newPasscode: string;
    newPasscodeRepeated: string;
};

export default function ChangePasscode() {
    const { t } = useTranslation('x', { keyPrefix: 'passcode' });

    const formRef = useRef<HTMLFormElement>(null);
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
        }
    };

    function validateCurrentPasscode(): Validate<string> {
        return (currentPasscode) => (currentPasscode !== passcode.value ? t('incorrectPasscode') : undefined);
    }

    function validateNewPasscode(getValues: UseFormGetValues<FormValues>): Validate<string> {
        return (newPasscodeRepeated) =>
            getValues().newPasscode !== newPasscodeRepeated ? t('form.passcodeMismatch') : undefined;
    }

    return (
        <Page className="change-passcode-x">
            <Page.Top heading={t('changePasscode')} />
            <Page.Main>
                <Form
                    id="change-password-form"
                    onSubmit={handleSubmit}
                    className="change-passcode-page__form"
                    formMethods={form}
                    ref={formRef}
                >
                    {(f) => {
                        return (
                            <>
                                <FormPassword
                                    control={f.control}
                                    name="currentPasscode"
                                    label={t('labels.currentPasscode')}
                                    rules={{
                                        required: t('form.passcodeRequired'),
                                        validate: validateCurrentPasscode(),
                                    }}
                                />
                                <span className="divider" />
                                <FormPassword
                                    control={f.control}
                                    name="newPasscode"
                                    label={t('labels.newPasscode')}
                                    rules={{
                                        required: t('form.passcodeRequired'),
                                        minLength: {
                                            value: 6,
                                            message: t('form.passcodeMinLength'),
                                        },
                                    }}
                                />
                                <FormPassword
                                    control={f.control}
                                    name="newPasscodeRepeated"
                                    label={t('labels.newPasscodeRepeated')}
                                    rules={{ validate: validateNewPasscode(f.getValues) }}
                                />
                            </>
                        );
                    }}
                </Form>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    form="change-password-form"
                    type="submit"
                    label={t('changePasscode')}
                    disabled={form.formState.isSubmitting}
                />
            </Page.Footer>
        </Page>
    );
}
