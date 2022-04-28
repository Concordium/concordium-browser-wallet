import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function Account() {
    const { address } = useParams();
    const { t } = useTranslation('account');

    return <div>{t('address', { address })}</div>;
}
