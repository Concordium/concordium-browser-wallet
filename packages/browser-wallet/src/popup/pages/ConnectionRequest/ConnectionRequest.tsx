import { absoluteRoutes } from '@popup/constants/routes';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import { sessionPasscodeAtom } from '@popup/store/settings';
import { useAtom, useAtomValue } from 'jotai';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Navigate } from 'react-router-dom';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [connectedSitesLoading, setConnectedSites] = useAtom(storedConnectedSitesAtom);
    const connectedSites = connectedSitesLoading.value;
    const passcode = useAtomValue(sessionPasscodeAtom);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (!selectedAccount || connectedSitesLoading.loading || passcode.loading) {
        return null;
    }

    // The wallet is locked, so prompt the user to unlock the wallet before connecting.
    if (!passcode.value) {
        return (
            <Navigate
                to={absoluteRoutes.login.path}
                state={{ to: absoluteRoutes.prompt.connectionRequest.path, toState: state }}
            />
        );
    }

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
    const urlOrigin = new URL(url).origin;

    return (
        <>
            <header>
                <h3>{t('title')}</h3>
            </header>
            <pre className="connection-request__url">{title}</pre>
            <pre className="connection-request__url">{urlOrigin}</pre>
            <div className="connection-request__address">{t('description', { selectedAccount })}</div>
            <div className="connection-request__actions">
                <button
                    type="button"
                    onClick={withClose(() => {
                        connectAccount(selectedAccount, urlOrigin);
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
