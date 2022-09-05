import { useAtomValue } from 'jotai';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { storedConnectedSitesAtom } from '@popup/store/account';
import { getCurrentOpenTabUrl } from '@popup/shared/utils/tabs';
import clsx from 'clsx';

type Props = {
    accountAddress?: string;
    getUrl?: () => Promise<string>;
    link?: string;
    onNavigate?: () => void;
};

/**
 * N.B. It is assumed that onNavigate is only given when the box has a link. If link is not provided, then onNavigate is ignored.
 */
export default function ConnectedBox({ accountAddress, getUrl = getCurrentOpenTabUrl, link, onNavigate }: Props) {
    const { t } = useTranslation('account');
    const connectedSites = useAtomValue(storedConnectedSitesAtom);
    const [isConnectedToSite, setIsConnectedToSite] = useState<boolean>();

    useMemo(() => {
        if (accountAddress && !connectedSites.loading) {
            getUrl().then((url) => {
                if (url) {
                    const connectedSitesForAccount = connectedSites.value[accountAddress] ?? [];
                    setIsConnectedToSite(connectedSitesForAccount.includes(url));
                }
            });
        }
    }, [accountAddress, connectedSites]);

    if (!link) {
        return (
            <div className={clsx('account-page__connection-box', !isConnectedToSite && 'account-page__not-connected')}>
                {isConnectedToSite ? t('siteConnected') : t('siteNotConnected')}
            </div>
        );
    }

    return (
        <Link
            className={clsx('account-page__connection-box', !isConnectedToSite && 'account-page__not-connected')}
            to={link}
            onClick={onNavigate}
        >
            {isConnectedToSite ? t('siteConnected') : t('siteNotConnected')}
        </Link>
    );
}
