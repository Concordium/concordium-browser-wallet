import React from 'react';
import Carousel from '@popup/popupX/shared/Carousel';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useNavigate } from 'react-router-dom';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { Trans, useTranslation } from 'react-i18next';

export default function BakerIntro() {
    const nav = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.intro' });
    return (
        <Page className="baker-intro-container">
            <Carousel onDone={() => nav(absoluteRoutes.settings.earn.validator.register.path, { replace: true })}>
                <Text.Capture>
                    <Page.Top heading={t('1.title')} />
                    <Trans t={t} i18nKey="1.body" />
                </Text.Capture>
                <Text.Capture>
                    <Page.Top heading={t('2.title')} />
                    <Trans t={t} i18nKey="2.body" />
                </Text.Capture>
                <Text.Capture>
                    <Page.Top heading={t('3.title')} />
                    <Trans t={t} i18nKey="3.body" />
                </Text.Capture>
            </Carousel>
        </Page>
    );
}
