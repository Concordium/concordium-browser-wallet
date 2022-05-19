import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type Props = {
    onSubmit(): void;
};

export default function SignMessage({ onSubmit }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('signMessage');
    const { withClose } = useContext(fullscreenPromptContext);

    return (
        <>
            <div>{t('description')}</div>
            {JSON.stringify(state)}
            <button type="button" onClick={withClose(onSubmit)}>
                {t('submit')}
            </button>
        </>
    );
}
