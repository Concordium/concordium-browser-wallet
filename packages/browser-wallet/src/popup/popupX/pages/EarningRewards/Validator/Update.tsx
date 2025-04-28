import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { relativeRoutes } from '@popup/popupX/constants/routes';

export default function ValidatorUpdate() {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.update' });
    const nav = useNavigate();

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <Text.Capture>{t('description')}</Text.Capture>
            <Page.Footer>
                <Button.Main
                    label={t('buttonStake')}
                    onClick={() => nav(relativeRoutes.settings.earn.validator.update.stake.path)}
                />
                <Button.Main
                    label={t('buttonPoolSettings')}
                    onClick={() => nav(relativeRoutes.settings.earn.validator.update.settings.path)}
                />
                <Button.Main
                    label={t('buttonKeys')}
                    onClick={() => nav(relativeRoutes.settings.earn.validator.update.keys.path)}
                />
            </Page.Footer>
        </Page>
    );
}
