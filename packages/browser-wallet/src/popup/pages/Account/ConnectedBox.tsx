import { useAtomValue } from 'jotai';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { storedConnectedSitesAtom } from '@popup/store/account';
import clsx from 'clsx';

type Props = {
    accountAddress?: string;
    url?: string;
} & (
    | { link: string; onNavigate?: () => void }
    | {
          link?: undefined;
          onNavigate?: undefined;
      }
);

export default function ConnectedBox({ accountAddress, url, link, onNavigate }: Props) {
    const { t } = useTranslation('account');
    const connectedSites = useAtomValue(storedConnectedSitesAtom);
    const [isConnectedToSite, setIsConnectedToSite] = useState<boolean>();

    useMemo(() => {
        if (accountAddress && !connectedSites.loading && url) {
            const connectedSitesForAccount = connectedSites.value[accountAddress] ?? [];
            setIsConnectedToSite(connectedSitesForAccount.includes(url));
        }
    }, [accountAddress, connectedSites, url]);

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
