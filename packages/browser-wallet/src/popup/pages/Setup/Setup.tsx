import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { absoluteRoutes } from '@popup/constants/routes';
import Form from '@popup/shared/Form';
import { SubmitHandler } from 'react-hook-form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { atom, useAtom } from 'jotai';
import { jsonRpcUrlAtom, keysAtom } from '@popup/store/settings';

type FormValues = {
    keys: string;
    url: string;
};

const separator = ';';

const formValuesAtom = atom(
    (get) => {
        const keys = get(keysAtom);
        const url = get(jsonRpcUrlAtom);

        return { keys: keys.join(separator), url };
    },
    (_, set, { keys, url }: FormValues) => {
        set(keysAtom, keys.split(separator));
        set(jsonRpcUrlAtom, url);
    }
);

export default function Setup() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const [values, setValues] = useAtom(formValuesAtom);

    const handleSubmit: SubmitHandler<FormValues> = (vs) => {
        setValues(vs);
        navigate(absoluteRoutes.home.path);
    };

    return (
        <>
            <header>
                <h4>{t('title')}</h4>
            </header>
            <Form onSubmit={handleSubmit} defaultValues={values}>
                {({ register }) => (
                    <>
                        <span>{t('form.labels.keys', { separator })}</span>
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
