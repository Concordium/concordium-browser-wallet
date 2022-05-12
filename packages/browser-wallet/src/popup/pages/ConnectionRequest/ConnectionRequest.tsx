import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import React, { useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');
    const { onClose, close } = useContext(fullscreenPromptContext);
    const withClose = useCallback(
        (action: () => void) => () => {
            action();
            close();
        },
        [close]
    );

    useEffect(() => onClose(onReject), [onClose, onReject]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { title, url } = (state as any).payload;

    return (
        <>
            <header>
                <h3>{t('title')}</h3>
            </header>
            <div>{t('description', { title })}</div>
            <pre className="connection-request__url">{url}</pre>
            <div className="connection-request__actions">
                <button type="button" onClick={withClose(onAllow)}>
                    {t('actions.allow')}
                </button>
                <button type="button" onClick={withClose(onReject)}>
                    {t('actions.reject')}
                </button>
            </div>
        </>
    );
}
