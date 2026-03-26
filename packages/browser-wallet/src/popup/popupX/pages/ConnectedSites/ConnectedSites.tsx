import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { generatePath, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import { storedAllowlistAtom } from '@popup/store/account';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

function ConnectedSites() {
    const { t } = useTranslation('x', { keyPrefix: 'connectedSites' });
    const nav = useNavigate();
    const [allowlistWithLoading] = useAtom(storedAllowlistAtom);
    const allowlist = allowlistWithLoading.value ?? {};
    const connectedSites = useMemo(() => Object.keys(allowlist), [allowlist]);
    const navToEdit = (serviceName: string) =>
        nav(
            generatePath(absoluteRoutes.settings.accounts.connectedSites.edit.path, {
                serviceName: encodeURIComponent(serviceName),
            })
        );
    const loadedSiteView =
        connectedSites.length === 0 ? (
            <Text.MainRegular>{t('noConnectedSites')}</Text.MainRegular>
        ) : (
            <Card>
                {connectedSites.map((serviceName) => (
                    <Card.Row key={serviceName}>
                        <Text.MainRegular>{displayUrl(serviceName)}</Text.MainRegular>
                        <Button.Main
                            size="small"
                            variant="secondary"
                            label={t('edit')}
                            onClick={() => navToEdit(serviceName)}
                        />
                    </Card.Row>
                ))}
            </Card>
        );
    return (
        <Page className="connected-sites-x">
            <Page.Top heading={t('connectedSites')} />
            <Page.Main>{allowlistWithLoading.loading ? null : loadedSiteView}</Page.Main>
        </Page>
    );
}

export default ConnectedSites;
