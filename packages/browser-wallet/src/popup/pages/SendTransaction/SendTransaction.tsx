import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export default function SendTransaction() {
    const { state } = useLocation();
    const { t } = useTranslation('sendTransaction');

    return (
        <>
            <div>{t('description')}</div>
            {JSON.stringify(state)}
        </>
    );
}
