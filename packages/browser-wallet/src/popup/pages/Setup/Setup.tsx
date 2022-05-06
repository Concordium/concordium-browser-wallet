import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { absoluteRoutes } from '@popup/constants/routes';
import Form from '@popup/shared/Form';
import { SubmitHandler } from 'react-hook-form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';

type FormValues = {
    keys: string;
    url: string;
};

export default function Setup() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');

    const handleSubmit: SubmitHandler<FormValues> = (values) => {
        // eslint-disable-next-line no-console
        console.log(values);
        navigate(absoluteRoutes.home.path);
    };

    return (
        <>
            <header>
                <h4>{t('title')}</h4>
            </header>
            <Form onSubmit={handleSubmit}>
                {({ register }) => (
                    <>
                        <FormInput
                            register={register}
                            name="keys"
                            rules={{ required: t('validation.keys.required') }}
                        />
                        <FormInput register={register} name="url" rules={{ required: t('validation.url.required') }} />
                        <Submit>{t('continue')}</Submit>
                    </>
                )}
            </Form>
        </>
    );
}
