import { useAtomValue } from 'jotai';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { storedAllowlistAtom } from '@popup/store/account';
import clsx from 'clsx';

type Props = {
    accountAddress?: string;
    url?: string;
};

export default function ConnectedBox({ accountAddress, url }: Props) {
    const { t } = useTranslation('account');
    const [isConnectedToSite, setIsConnectedToSite] = useState<boolean>();
    const allowlist = useAtomValue(storedAllowlistAtom);

    useMemo(() => {
        if (accountAddress && !allowlist.loading && url) {
            const connectedAccountsForUrl = allowlist.value[url] ?? [];
            setIsConnectedToSite(connectedAccountsForUrl.includes(accountAddress));
        }
    }, [accountAddress, allowlist, url]);

    return (
        <div className={clsx('account-page__connection-box', !isConnectedToSite && 'account-page__not-connected')}>
            {isConnectedToSite ? t('siteConnected') : t('siteNotConnected')}
        </div>
    );
}
