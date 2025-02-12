import React, { useMemo } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import { Navigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { storedAllowlistAtom } from '@popup/store/account';
import { displayNameAndSplitAddress, useCredential } from '@popup/shared/utils/account-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { EventType } from '@concordium/browser-wallet-api-helpers';

type ConnectedSitesProps = {
    address: string;
};

function ConnectedSites({ address }: ConnectedSitesProps) {
    const { t } = useTranslation('x', { keyPrefix: 'connectedSites' });
    const [allowlistWithLoading, setAllowList] = useAtom(storedAllowlistAtom);
    const credential = useCredential(address);
    const allowlist = allowlistWithLoading.value ?? {};
    const connectedAccountSites = useMemo(
        () =>
            Object.entries(allowlist).flatMap(([url, accounts]) => {
                const accountIndex = accounts.findIndex((a) => a === address);
                return accountIndex === -1 ? [] : [{ url, accountIndex }];
            }),
        [allowlist, address]
    );
    const onDisconnect = (url: string, accountIndex: number) => async () => {
        const updatedAllowlist = { ...allowlist, [url]: allowlist[url].toSpliced(accountIndex, 1) };
        await setAllowList(updatedAllowlist);
        popupMessageHandler.broadcastToUrl(EventType.AccountDisconnected, url, address);
    };
    const loadedSiteView =
        connectedAccountSites.length === 0 ? (
            <Text.MainRegular>No sites connected to this account</Text.MainRegular>
        ) : (
            <Card>
                {connectedAccountSites.map((site) => (
                    <Card.Row key={site.url}>
                        <Text.MainRegular>{new URL(site.url).host}</Text.MainRegular>
                        <Button.Secondary
                            className="dark"
                            label={t('disconnect')}
                            onClick={onDisconnect(site.url, site.accountIndex)}
                        />
                    </Card.Row>
                ))}
            </Card>
        );
    return (
        <Page className="connected-sites-x">
            <Page.Top heading={t('connectedSites')}>
                <Text.Capture>{displayNameAndSplitAddress(credential)}</Text.Capture>
            </Page.Top>
            <Page.Main>{allowlistWithLoading.loading ? null : loadedSiteView}</Page.Main>
        </Page>
    );
}

export default function Loader() {
    const params = useParams();
    if (params.account === undefined) {
        // No account address passed in the url.
        return <Navigate to="../" />;
    }
    return <ConnectedSites address={params.account} />;
}
