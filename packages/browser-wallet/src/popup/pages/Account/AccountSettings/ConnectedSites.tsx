import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';
import { useTranslation } from 'react-i18next';

export default function ConnectedSites() {
    const { t } = useTranslation('account', { keyPrefix: 'settings.connectedSites' });
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [connectedSitesLoading, setConnectedSites] = useAtom(storedConnectedSitesAtom);
    const connectedSites = connectedSitesLoading.value;

    if (!selectedAccount) {
        return null;
    }

    const localSites = connectedSites[selectedAccount] ?? [];
    if (!connectedSitesLoading.loading && localSites.length === 0) {
        return (
            <div className="connected-sites-list">
                <div className="connected-sites-list__element">{t('noConnected')}</div>
            </div>
        );
    }

    function removeConnectedSite(site: string, account: string) {
        const currentConnectedSitesForAccount = connectedSites[account] ?? [];
        const updatedConnectedSitesForAccount = currentConnectedSitesForAccount.filter((v) => v !== site);

        const connectedSitesWithSiteRemoved = {
            ...connectedSites,
        };

        connectedSitesWithSiteRemoved[account] = updatedConnectedSitesForAccount;
        setConnectedSites(connectedSitesWithSiteRemoved);
    }

    return (
        <div className="connected-sites-list">
            {localSites.map((site) => {
                return (
                    <div className="connected-sites-list__element" key={site}>
                        <div>{site}</div>
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
