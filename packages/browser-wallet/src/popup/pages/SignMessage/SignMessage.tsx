import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export default function SignMessage() {
    const { state } = useLocation();
    const { t } = useTranslation('signMessage');

    return (
        <>
            <div>{t('description')}</div>
            {JSON.stringify(state)}
        </>
    );
}
