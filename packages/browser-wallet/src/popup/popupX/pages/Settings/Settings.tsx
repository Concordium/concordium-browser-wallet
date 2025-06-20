import React from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import GoogleAnalytics from '@popup/popupX/pages/Settings/GoogleAnalytics';

function Settings() {
    const { t } = useTranslation('x', { keyPrefix: 'configuration' });

    return (
        <Page className="configuration-x">
            <Page.Top heading={t('settings')} />
            <Page.Main>
                <GoogleAnalytics />
            </Page.Main>
        </Page>
    );
}

export default Settings;
