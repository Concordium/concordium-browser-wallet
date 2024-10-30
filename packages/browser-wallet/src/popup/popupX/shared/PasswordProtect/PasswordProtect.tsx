import React from 'react';
import { Validate } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import FormPassword from '@popup/popupX/shared/Form/Password';
import Form from '@popup/popupX/shared/Form/Form';
import { sessionPasscodeAtom } from '@popup/store/settings';
import { useForm } from '@popup/shared/Form';
import { TranslationKeyX } from '@popup/shell/i18n/i18n';

type FormValues = {
    currentPasscode: string;
};

export type PasswordProtectConfigType = {
    headingKey: TranslationKeyX;
    pageInfoKey: TranslationKeyX;
    submitKey: TranslationKeyX;
};

type PasswordProtectProps = {
    setPasswordConfirmed: (passwordConfirmed: boolean) => void;
    config: PasswordProtectConfigType;
};

export default function PasswordProtect({
    setPasswordConfirmed,
    config: { headingKey, pageInfoKey, submitKey },
}: PasswordProtectProps) {
    const { t: tUse } = useTranslation('x');
    const t = (key: TranslationKeyX) => tUse(key) as unknown as string;
    const { t: tPasscode } = useTranslation('x', { keyPrefix: 'sharedX.form.password' });
    const passcode = useAtomValue(sessionPasscodeAtom);
    const form = useForm<FormValues>();

    const handleSubmit = () => {
        setPasswordConfirmed(true);
    };

    function validateCurrentPasscode(): Validate<string> {
        return (currentPasscode) => (currentPasscode !== passcode.value ? tPasscode('incorrectPasscode') : undefined);
    }

    return (
        <Page className="confirm-password-x">
            <Page.Top heading={t(headingKey)} />
            <Page.Main>
                <Text.MainRegular>{t(pageInfoKey)}</Text.MainRegular>
                <Form id="confirm-password-form" onSubmit={handleSubmit} formMethods={form}>
                    {(f) => {
                        return (
                            <FormPassword
                                control={f.control}
                                name="currentPasscode"
                                label={tPasscode('currentPasscode')}
                                className="m-t-10"
                                rules={{
                                    required: tPasscode('passcodeRequired'),
                                    validate: validateCurrentPasscode(),
                                }}
                            />
                        );
                    }}
                </Form>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    form="confirm-password-form"
                    type="submit"
                    label={t(submitKey)}
                    disabled={form.formState.isSubmitting}
                />
            </Page.Footer>
        </Page>
    );
}
