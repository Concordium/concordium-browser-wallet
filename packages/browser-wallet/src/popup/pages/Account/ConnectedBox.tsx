import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { storedAllowlistAtom } from '@popup/store/account';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface Props {
    accountAddress?: string;
    url?: string;
    link?: string;
}

export default function ConnectedBox({ accountAddress, url, link }: Props) {
    const { t } = useTranslation('account');
    const [isWalletConnectedToSite, setWalletConnectedToSite] = useState<boolean>();
    const [isAccountConnectedToSite, setAccountConnectedToSite] = useState<boolean>();
    const allowlist = useAtomValue(storedAllowlistAtom);

    useEffect(() => {
        if (accountAddress && !allowlist.loading && url) {
            const allowlistForUrl = allowlist.value[url];
            const connectedAccountsForUrl = allowlistForUrl ?? [];
            setAccountConnectedToSite(connectedAccountsForUrl.includes(accountAddress));
            setWalletConnectedToSite(allowlistForUrl !== undefined);
        }
    }, [accountAddress, allowlist, url]);

    if (!link || (!isWalletConnectedToSite && !isAccountConnectedToSite)) {
        return (
            <div
                className={clsx(
                    'account-page__connection-box',
                    !isAccountConnectedToSite && 'account-page__not-connected'
                )}
            >
                {isAccountConnectedToSite ? t('siteConnected') : t('siteNotConnected')}
            </div>
        );
    }

    return (
        <Link
            className={clsx('account-page__connection-box', !isAccountConnectedToSite && 'account-page__not-connected')}
            to={link}
        >
            {isAccountConnectedToSite ? t('siteConnected') : t('siteNotConnected')}
        </Link>
    );
}
