import React from 'react';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';

export default function RestoreWallet() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.restoreWallet' });
    return (
        <Page className="restore-wallet">
            <Page.Top heading={t('restoreWallet')} />
            <Page.Main>
                <Text.Capture>{t('restoreInfo')}</Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('continue')} />
            </Page.Footer>
        </Page>
    );
}
