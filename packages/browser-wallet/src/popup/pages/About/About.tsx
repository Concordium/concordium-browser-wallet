import NavList from '@popup/shared/NavList';
import React from 'react';
import { useTranslation } from 'react-i18next';
import urls from '@shared/constants/url';
import ExternalLink from '@popup/shared/ExternalLink';
import { useAtomValue } from 'jotai';
import { acceptedTermsAtom } from '@popup/store/settings';
import packageJson from '../../../../package.json';

export default function About() {
    const { t } = useTranslation('about');
    const { loading: loadingAcceptedTerms, value: acceptedTerms } = useAtomValue(acceptedTermsAtom);

    if (loadingAcceptedTerms) {
        return null;
    }

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
                        <ExternalLink path={urls.documentationWebsite}>{t('documentation')}</ExternalLink>
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.supportWebsite}>{t('support')}</ExternalLink>
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.website}>{t('website')}</ExternalLink>
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={acceptedTerms?.url || urls.termsAndConditions}>{t('terms')}</ExternalLink>
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path={urls.licenseAttributions}>{t('license')}</ExternalLink>
                    </div>
                </NavList>
            </div>
        </div>
    );
}
