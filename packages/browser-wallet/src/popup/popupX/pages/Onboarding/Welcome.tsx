import React, { ReactNode, useEffect } from 'react';
import Shield from '@assets/svgX/crypto-currency-square-shield.svg';
import Assets from '@assets/svgX/crypto-currency-assets.svg';
import Possibilities from '@assets/svgX/crypto-currency-possibilities.svg';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import ExternalLink from '@popup/popupX/shared/ExternalLink';
import urls from '@shared/constants/url';
import Text from '@popup/popupX/shared/Text';
import Page from '@popup/popupX/shared/Page';

const bg = document.getElementsByClassName('bg').item(0);

function Description({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="welcome__description">
            <div className="welcome__description_icon">{icon}</div>
            <div className="welcome__description_text">
                <Text.Main>{title}</Text.Main>
                <Text.Capture>{description}</Text.Capture>
            </div>
        </div>
    );
}

export default function Welcome() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.welcome' });
    const nav = useNavigate();
    const navToPassword = () => nav(absoluteRoutes.onboarding.setupPassword.path);

    useEffect(() => {
        bg?.classList.add('welcome-page');
    }, []);

    return (
        <Page className="welcome">
            <Page.Top heading={t('welcomeTo')} />
            <Page.Main>
                <Description icon={<Shield />} title={t('safeSecure')} description={t('trusted')} />
                <Description icon={<Assets />} title={t('easyManage')} description={t('spendAssets')} />
                <Description icon={<Possibilities />} title={t('unlimited')} description={t('transactionInvest')} />
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    label={t('start')}
                    onClick={() => {
                        bg?.classList.remove('welcome-page');
                        navToPassword();
                    }}
                />
                <div className="welcome__footer">
                    <Text.Capture>
                        {t('proceeding')}
                        <ExternalLink path={urls.termsAndConditions}>{t('termsAndConditions')}</ExternalLink>
                    </Text.Capture>
                </div>
            </Page.Footer>
        </Page>
    );
}
