import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, Validate } from 'react-hook-form';
import { atom, useAtom } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import Form from '@popup/shared/Form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { jsonRpcUrlAtom, credentialsAtom } from '@popup/store/settings';
import { WalletCredential } from '@shared/storage/types';
import PageHeader from '@popup/shared/PageHeader';
import { selectedAccountAtom } from '@popup/store/account';
import ThemeSwitch from './ThemeSwitch';

type FormValues = {
    credentials: string;
    url: string;
};

const fieldSeparator = ',';
const lineSeparator = ';';

const credFromCsvLine = (cred: string): WalletCredential => {
    const [key, address, unexpected] = cred.split(fieldSeparator);

    if (!address) {
        throw new Error('Expected address as second value in csv line');
    } else if (unexpected) {
        throw new Error('Unexpected third value in csv line');
    }

    return { key, address };
};

const credsFromCsv = (creds: string): WalletCredential[] => creds.split(lineSeparator).map(credFromCsvLine);

const credToCsvLine = ({ key, address }: WalletCredential): string => `${key}${fieldSeparator}${address}`;

const formValuesAtom = atom<Partial<FormValues>, FormValues, void>(
    (get) => {
        const creds = get(credentialsAtom);
        const url = get(jsonRpcUrlAtom);

        return { credentials: creds.map(credToCsvLine).join(lineSeparator), url };
    },
    (_, set, { credentials, url }: FormValues) => {
        const creds = credsFromCsv(credentials);

        set(credentialsAtom, creds);
        set(selectedAccountAtom, creds[0].address);
        set(jsonRpcUrlAtom, url);
    }
);

const validateCredentials =
    (message: string): Validate<string> =>
    (input) => {
        try {
            credsFromCsv(input);
            return true;
        } catch {
            return message;
        }
    };

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
            <PageHeader>{t('title')}</PageHeader>
            <Form onSubmit={handleSubmit} defaultValues={values} className="p-10">
                {({ register }) => (
                    <>
                        <ThemeSwitch />
                        <FormInput
                            className="setup__field"
                            label={t('form.labels.credentials')}
                            note={t('form.notes.credentials', { lineSeparator, fieldSeparator })}
                            register={register}
                            name="credentials"
                            rules={{
                                required: t('validation.credentials.required'),
                                validate: validateCredentials(
                                    t('validation.credentials.format', { lineSeparator, fieldSeparator })
                                ),
                            }}
                        />
                        <FormInput
                            className="setup__field"
                            label={t('form.labels.url')}
                            register={register}
                            name="url"
                            rules={{ required: t('validation.url.required') }}
                        />
                        <Submit className="setup__submit">{t('continue')}</Submit>
                    </>
                )}
            </Form>
        </>
    );
}
