import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import { useAtom, useAtomValue } from 'jotai';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [connectedSites, setConnectedSites] = useAtom(storedConnectedSitesAtom);

    if (!selectedAccount) {
        return null;
    }

    useEffect(() => onClose(onReject), [onClose, onReject]);

    function connectAccount(account: string, url: string) {
        const updatedConnectedSites = {
            ...connectedSites,
        };

        const connectedSitesForAccount = connectedSites[account] ?? [];
        connectedSitesForAccount.push(url);
        updatedConnectedSites[account] = connectedSitesForAccount;

        setConnectedSites(updatedConnectedSites);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { title, url } = (state as any).payload;

    return (
        <>
            <header>
                <h3>{t('title')}</h3>
            </header>
            <pre className="connection-request__url">{title}</pre>
            <pre className="connection-request__url">{url}</pre>
            <div>{t('description', { selectedAccount })}</div>
            <div className="connection-request__actions">
                <button
                    type="button"
                    onClick={withClose(() => {
                        connectAccount(selectedAccount, url);
                        onAllow();
                    })}
                >
                    {t('actions.allow')}
                </button>
                <button type="button" onClick={withClose(onReject)}>
                    {t('actions.reject')}
                </button>
            </div>
        </>
    );
}
