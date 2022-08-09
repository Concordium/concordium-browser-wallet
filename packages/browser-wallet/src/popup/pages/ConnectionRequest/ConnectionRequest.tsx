import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { accountsAtom, storedConnectedSitesAtom } from '@popup/store/account';
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
    const accounts = useAtomValue(accountsAtom);
    const [connectedSites, setConnectedSites] = useAtom(storedConnectedSitesAtom);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    function connectAccounts(accountAddresses: string[], url: string) {
        const updatedRecord: Record<string, string[]> = connectedSites;

        for (const accountAddress of accountAddresses) {
            const currentConnectedSites = connectedSites[accountAddress];
            const updatedConnectedSites = [];
            if (currentConnectedSites && !currentConnectedSites.includes(url)) {
                updatedConnectedSites.push(...currentConnectedSites, url);
            } else {
                updatedConnectedSites.push(url);
            }
            updatedRecord[accountAddress] = updatedConnectedSites;
        }

        setConnectedSites(updatedRecord);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { title, url } = (state as any).payload;

    // TODO The user must select the accounts to connect to instead of connecting to all.
    return (
        <>
            <header>
                <h3>{t('title')}</h3>
            </header>
            <div>{t('description', { title })}</div>
            <pre className="connection-request__url">{url}</pre>

            <div>The following accounts will be connected to the site</div>
            <div className="account-list">
                {accounts.length > 0 &&
                    accounts.map((account) => {
                        return (
                            <div className="account-list__element" key={account}>
                                {account.substring(0, 10)}
                            </div>
                        );
                    })}
            </div>

            <div className="connection-request__actions">
                <button
                    type="button"
                    onClick={withClose(() => {
                        connectAccounts(accounts, url);
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
