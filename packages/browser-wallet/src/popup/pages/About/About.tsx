import NavList from '@popup/shared/NavList';
import React from 'react';
import { useTranslation } from 'react-i18next';
import urls from '@popup/constants/urls';
import ExternalLink from '@popup/shared/ExternalLink';
import packageJson from '../../../../package.json';

export default function About() {
    const { t } = useTranslation('about');

    return (
        <div className="about-page">
            <div>
                <h3>{t('version')}</h3>
                {packageJson.version}
            </div>

            <div className="about-page__support">
                <h3>{t('title')}</h3>
                {t('description')}
                <a href="mailto:support@concordium.software">support@concordium.software</a>
            </div>

            <div>
                <h3>Links</h3>
                <NavList>
                    <div className="about-page__item">
                        <ExternalLink path={urls.documentationWebsite} label={t('documentation')} />
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.supportWebsite} label={t('support')} />
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.website} label={t('website')} />
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.termsAndConditions} label={t('terms')} />
                    </div>
                    <div className="about-page__item">{t('license')}</div>
                </NavList>
            </div>
        </div>
    );
}
