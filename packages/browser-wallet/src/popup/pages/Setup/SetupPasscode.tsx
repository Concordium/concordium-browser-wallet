import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, UseFormGetValues, Validate } from 'react-hook-form';
import { absoluteRoutes } from '@popup/constants/routes';
import Form from '@popup/shared/Form';
import Submit from '@popup/shared/Form/Submit';
import PageHeader from '@popup/shared/PageHeader';
import FormPassword from '@popup/shared/Form/Password';
import { useSetAtom } from 'jotai';
import { passcodeAtom } from '@popup/state';
import { setupRoutes } from './routes';

type FormValues = {
    passcode: string;
    passcodeAgain: string;
};

export default function SetupPasscode() {
    const { t } = useTranslation('setup');
    const navigate = useNavigate();
    const setPasscode = useSetAtom(passcodeAtom);

    const handleSubmit: SubmitHandler<FormValues> = (vs) => {
        setPasscode(vs.passcode);
        navigate(`${absoluteRoutes.setup.path}/${setupRoutes.createOrRestore}`);
    };

    function validatePasscode(getValues: UseFormGetValues<FormValues>): Validate<string> {
        return (passcodeAgain) =>
            getValues().passcode !== passcodeAgain ? t('setupPasscode.form.passcodeMismatch') : undefined;
    }

    return (
        <>
            <PageHeader>{t('setupPasscode.title')}</PageHeader>
            <div className="onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">{t('setupPasscode.description')}</div>
                <Form onSubmit={handleSubmit} className="onboarding-setup__page-with-header__choose-passcode">
                    {(f) => {
                        return (
                            <>
                                <div>
                                    <FormPassword
                                        autoFocus
                                        control={f.control}
                                        className="onboarding-setup__page-with-header__choose-passcode__field"
                                        showStrength
                                        name="passcode"
                                        label={t('setupPasscode.form.enterPasscode')}
                                        rules={{
                                            required: t('setupPasscode.form.passcodeRequired'),
                                            minLength: { value: 6, message: t('setupPasscode.form.passcodeMinLength') },
                                        }}
                                    />
                                    <FormPassword
                                        control={f.control}
                                        className="onboarding-setup__page-with-header__choose-passcode__field"
                                        name="passcodeAgain"
                                        label={t('setupPasscode.form.enterPasscodeAgain')}
                                        rules={{ validate: validatePasscode(f.getValues) }}
                                    />
                                </div>
                                <Submit className="onboarding-setup__page-with-header__continue-button" width="medium">
                                    {t('continue')}
                                </Submit>
                            </>
                        );
                    }}
                </Form>
            </div>
        </>
    );
}
