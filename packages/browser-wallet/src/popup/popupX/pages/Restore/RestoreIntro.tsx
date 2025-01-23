import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

export default function RestoreIntro() {
    const { t } = useTranslation('x', { keyPrefix: 'restore' });
    const nav = useNavigate();
    const navToMain = () => nav(absoluteRoutes.settings.restore.main.path);

    return (
        <Page className="restore-intro-x">
            <Page.Top heading={t('restoreIds')} />
            <Page.Main>
                <Text.Capture>{t('restoreInfo')}</Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('restore')} onClick={navToMain} />
            </Page.Footer>
        </Page>
    );
}
