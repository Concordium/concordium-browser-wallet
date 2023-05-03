import NavList from '@popup/shared/NavList';
import React from 'react';
import { useTranslation } from 'react-i18next';
import urls from '@shared/constants/url';
import ExternalLink from '@popup/shared/ExternalLink';
import { getVersionName } from 'src/shared/utils/environment-helpers';

export default function About() {
    const { t } = useTranslation('about');

    return (
        <div className="about-page">
            <div>
                <h3>{t('version')}</h3>
                {getVersionName()}
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
                        <ExternalLink path={urls.documentationWebsite}>{t('documentation')}</ExternalLink>
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.supportWebsite}>{t('support')}</ExternalLink>
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.website}>{t('website')}</ExternalLink>
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.termsAndConditions}>{t('terms')}</ExternalLink>
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.licenseAttributions}>{t('license')}</ExternalLink>
                    </div>
                </NavList>
            </div>
        </div>
    );
}
