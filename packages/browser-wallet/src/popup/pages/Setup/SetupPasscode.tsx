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
            getValues().passcode !== passcodeAgain ? t('form.labels.passcodeMismatch') : undefined;
    }

    return (
        <>
            <PageHeader>{t('title')}</PageHeader>
            <div className="p-10 align-center">{t('form.labels.passcodeDescription')}</div>
            <Form onSubmit={handleSubmit} className="choose-passcode">
                {(f) => {
                    return (
                        <>
                            <div>
                                <FormPassword
                                    control={f.control}
                                    className="setup__field"
                                    showStrength
                                    name="passcode"
                                    label={t('form.labels.enterPasscode')}
                                    rules={{
                                        required: t('form.labels.passcodeRequired'),
                                        minLength: { value: 6, message: t('form.labels.passcodeMinLength') },
                                    }}
                                />
                                <FormPassword
                                    control={f.control}
                                    className="setup__field"
                                    name="passcodeAgain"
                                    label={t('form.labels.enterPasscodeAgain')}
                                    rules={{ validate: validatePasscode(f.getValues) }}
                                />
                            </div>
                            <Submit width="narrow">{t('continue')}</Submit>
                        </>
                    );
                }}
            </Form>
        </>
    );
}
