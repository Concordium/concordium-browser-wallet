import React from 'react';
import DigitalTrust from '@assets/svgX/company-digital-trust.svg';
import Notabene from '@assets/svgX/company-notabene.svg';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';

interface ProviderOptionProps {
    icon: React.ReactNode;
    name: string;
}

function ProviderOption({ icon, name }: ProviderOptionProps) {
    return (
        <div className="request-identity__provider_option">
            <div className="provider__icon">{icon}</div>
            <div className="provider__name">
                <Text.Label>{name}</Text.Label>
            </div>
        </div>
    );
}

export default function RequestIdentity() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.requestIdentity' });
    const nav = useNavigate();
    const navToNext = () => nav(`../${relativeRoutes.onboarding.idSubmitted.path}`);
    return (
        <Page className="request-identity">
            <Page.Top heading={t('requestId')} />
            <Page.Main>
                <Text.Capture>{t('identityProvider')}</Text.Capture>
                <div className="request-identity__provider">
                    <ProviderOption icon={<DigitalTrust />} name="Digital Trust Solutions" />
                    <ProviderOption icon={<Notabene />} name="Notabene" />
                </div>
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('request')} onClick={() => navToNext()} />
            </Page.Footer>
        </Page>
    );
}
