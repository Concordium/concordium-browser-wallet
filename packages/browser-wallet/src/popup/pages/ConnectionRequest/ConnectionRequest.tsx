import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');

    return (
        <>
            <header>
                <h3>{t('title')}</h3>
            </header>
            <div>{t('description')}</div>
            {JSON.stringify(state)}
            <div className="connection-request__actions">
                <button type="button" onClick={() => onAllow()}>
                    {t('actions.allow')}
                </button>
                <button type="button" onClick={() => onReject()}>
                    {t('actions.reject')}
                </button>
            </div>
        </>
    );
}
