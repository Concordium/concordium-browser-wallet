import NavList from '@popup/shared/NavList';
import React from 'react';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../../package.json';

function ExternalLink({ path, label }: { path: string; label: string }) {
    return (
        <a href={`${path}`} target="_blank" rel="noreferrer">
            {label}
        </a>
    );
}

export default function About() {
    const { t } = useTranslation('about');

    return (
        <div className="about-page">
            <div>
                <h3>{t('version')}</h3>
                {packageJson.version}
            </div>

            <div className="about-page__support">
                <h3>Support</h3>
                If you encountered a problem, or need help with something, you can reach out to us via
                <a href="mailto:support@concordium.software">support@concordium.software</a>
            </div>

            <div>
                <h3>Links</h3>
                <NavList>
                    <div className="about-page__item">
                        <ExternalLink
                            path="https://developer.concordium.software/en/mainnet/index.html"
                            label={t('documentation')}
                        />
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path="https://support.concordium.software" label={t('support')} />
                    </div>
                    <div className="about-page__item">
                        <ExternalLink path="https://www.concordium.com" label={t('website')} />
                    </div>
                    <div className="about-page__item">Terms and conditions</div>
                    <div className="about-page__item">License notices</div>
                </NavList>
            </div>
        </div>
    );
}
