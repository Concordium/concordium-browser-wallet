import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';

import Form from '@popup/shared/Form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { credentialsAtom } from '@popup/store/settings';
import { WalletCredential } from '@shared/storage/types';
import { selectedAccountAtom } from '@popup/store/account';

type FormValues = WalletCredential;

export default function AddAccount() {
    const { t } = useTranslation('addAccount');
    const nav = useNavigate();
    const [creds, setCreds] = useAtom(credentialsAtom);
    const [, setSelectedAccount] = useAtom(selectedAccountAtom);

    const handleSubmit = (cred: FormValues) => {
        setCreds([...creds, cred]);
        setSelectedAccount(cred.address);

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
                        className="m-t-10"
                    />
                    <Submit width="wide" className="block m-t-10 margin-center">
                        {t('add')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
