import React, { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';
import { useTranslation } from 'react-i18next';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { EventType } from '@concordium/browser-wallet-api-helpers';

function displayUrl(url: string) {
    const { hostname } = new URL(url);

    if (hostname.length < 29) {
        return hostname;
    }

    return `${hostname.substring(0, 29)}...`;
}

export default function ConnectedSites() {
    const { t } = useTranslation('account', { keyPrefix: 'settings.connectedSites' });
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [connectedSitesLoading, setConnectedSites] = useAtom(storedConnectedSitesAtom);
    const connectedSites = connectedSitesLoading.value;
    const [openTabUrl, setOpenTabUrl] = useState<string>();

    async function getCurrentOpenTabUrl() {
        const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        const { url } = tabs[0];
        if (!url) {
            return undefined;
        }
        return new URL(url).origin;
    }

    useEffect(() => {
        getCurrentOpenTabUrl().then(setOpenTabUrl);
    }, []);

    if (!selectedAccount) {
        return null;
    }

    const localSites = connectedSites[selectedAccount] ?? [];
    if (!openTabUrl && !connectedSitesLoading.loading && localSites.length === 0) {
        return (
            <div className="connected-sites-list">
                <div className="connected-sites-list__element">{t('noConnected')}</div>
            </div>
        );
    }

    function updateConnectedSites(updatedConnectedSitesForAccount: string[], account: string) {
        const connectedSitesWithSiteAdded = {
            ...connectedSites,
        };
        connectedSitesWithSiteAdded[account] = updatedConnectedSitesForAccount;
        setConnectedSites(connectedSitesWithSiteAdded);
    }

    function connectSite(site: string, account: string) {
        const currentConnectedSitesForAccount = connectedSites[account] ?? [];
        if (currentConnectedSitesForAccount.includes(site)) {
            return;
        }

        const updatedConnectedSitesForAccount = [site];
        updatedConnectedSitesForAccount.push(...currentConnectedSitesForAccount);
        updateConnectedSites(updatedConnectedSitesForAccount, account);
        popupMessageHandler.broadcastToUrl(EventType.AccountChanged, site, account);
    }

    function removeConnectedSite(site: string, account: string) {
        const currentConnectedSitesForAccount = connectedSites[account] ?? [];
        const updatedConnectedSitesForAccount = currentConnectedSitesForAccount.filter((v) => v !== site);
        updateConnectedSites(updatedConnectedSitesForAccount, account);
        popupMessageHandler.broadcastToUrl(EventType.AccountDisconnected, site, account);
    }

    return (
        <div className="connected-sites-list">
            {openTabUrl && !localSites.includes(openTabUrl) && (
                <div className="connected-sites-list__element" key={openTabUrl}>
                    <div title={openTabUrl}>{displayUrl(openTabUrl)}</div>
                    <Button
                        clear
                        className="connected-sites-list__element__connect"
                        onClick={() => connectSite(openTabUrl, selectedAccount)}
                    >
                        {t('connect')}
                    </Button>
                </div>
            )}
            {localSites.map((site) => {
                return (
                    <div className="connected-sites-list__element" key={site}>
                        <div title={site}>{displayUrl(site)}</div>
                        <Button
                            clear
                            className="connected-sites-list__element__disconnect"
                            onClick={() => removeConnectedSite(site, selectedAccount)}
                        >
                            {t('disconnect')}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
