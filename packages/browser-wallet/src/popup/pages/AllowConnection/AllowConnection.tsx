import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function AllowConnection({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('allowConnection');

    return (
        <>
            <div>{t('description')}</div>
            {JSON.stringify(state)}
            <button type="button" onClick={() => onAllow()}>
                {t('actions.allow')}
            </button>
            <button type="button" onClick={() => onReject()}>
                {t('actions.reject')}
            </button>
        </>
    );
}
