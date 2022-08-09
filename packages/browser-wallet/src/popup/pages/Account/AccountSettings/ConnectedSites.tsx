import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';

export default function ConnectedSites() {
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [connectedSites, setConnectedSites] = useAtom(storedConnectedSitesAtom);

    if (!selectedAccount) {
        return null;
    }

    const localSites = connectedSites[selectedAccount];
    if (!localSites || localSites.length === 0) {
        return (
            <div className="connected-sites-list">
                <div className="connected-sites-list__element">The selected account is not connected to any sites.</div>
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
                            Disconnect
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
