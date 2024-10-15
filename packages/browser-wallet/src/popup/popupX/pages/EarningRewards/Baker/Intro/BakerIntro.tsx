import React from 'react';
import Carousel from '@popup/popupX/shared/Carousel';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useNavigate } from 'react-router-dom';
import Page from '@popup/popupX/shared/Page';
import { Trans, useTranslation } from 'react-i18next';

export default function BakerIntro() {
    const nav = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.intro' });
    return (
        <Page className="baker-intro-container">
            <Carousel onDone={() => nav(absoluteRoutes.settings.earn.baker.register.path)}>
                <span className="capture__main_small">
                    <Page.Top heading={t('1.title')} />
                    <Trans t={t} i18nKey="1.body" />
                </span>
                <span className="capture__main_small">
                    <Page.Top heading={t('2.title')} />
                    <Trans t={t} i18nKey="2.body" />
                </span>
                <span className="capture__main_small">
                    <Page.Top heading={t('3.title')} />
                    <Trans t={t} i18nKey="3.body" />
                </span>
            </Carousel>
        </Page>
    );
}
