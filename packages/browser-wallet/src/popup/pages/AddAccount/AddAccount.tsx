import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Form from '@popup/shared/Form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';

type FormValues = {
    key: string;
    address: string;
};

export default function AddAccount() {
    const { t } = useTranslation('addAccount');
    const nav = useNavigate();

    const handleSubmit = (vs: FormValues) => {
        // eslint-disable-next-line no-console
        console.log(vs);
        nav(-1);
    };

    return (
        <Form<FormValues> onSubmit={handleSubmit}>
            {({ register }) => (
                <>
                    <FormInput
                        label={t('key.label')}
                        register={register}
                        name="key"
                        rules={{ required: t('key.validation.required') }}
                    />
                    <FormInput
                        label={t('address.label')}
                        register={register}
                        name="address"
                        rules={{ required: t('address.validation.required') }}
                    />
                    <Submit width="wide" className="block m-t-10 margin-center">
                        {t('add')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
