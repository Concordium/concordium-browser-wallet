import { useAtom } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Form from '@popup/shared/Form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { jsonRpcUrlAtom } from '@popup/store/settings';
import { useNavigate } from 'react-router-dom';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { EventType } from '@concordium/browser-wallet-api-helpers';

type FormValues = {
    url: string;
};

export default function NetworkSettings() {
    const { t } = useTranslation('networkSettings');
    const nav = useNavigate();
    const [url, setUrl] = useAtom(jsonRpcUrlAtom);

    const handleSubmit = (vs: FormValues) => {
        setUrl(vs.url);
        nav(-1);
        // TODO The URL should be exchanged with a unique identifier for the chain, e.g. the genesis hash or similar.
        popupMessageHandler.broadcast(EventType.ChainChanged, vs.url);
    };

    return (
        <Form<FormValues> onSubmit={handleSubmit} defaultValues={{ url }}>
            {({ register }) => (
                <>
                    <FormInput
                        label={t('url.label')}
                        register={register}
                        name="url"
                        rules={{ required: t('url.validation.required') }}
                    />
                    <Submit width="wide" className="block m-t-10 margin-center">
                        {t('save')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
