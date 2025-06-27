import React, { ReactNode, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
    acceptedActivityTrackingAtom,
    acceptedTermsAtom,
    networkConfigurationAtom,
    uiStyleAtom,
} from '@popup/store/settings';
import { mainnet } from '@shared/constants/networkConfiguration';
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
import { useAsyncMemo } from 'wallet-common-helpers';
import { getTermsAndConditionsConfig } from '@shared/utils/network-helpers';
import { UiStyle } from '@shared/storage/types';
import { Checkbox } from '@popup/popupX/shared/Form/Checkbox';
import appTracker from '@shared/analytics';

const bg = document.getElementsByClassName('bg').item(0);

function createAnalyticsTrackingObject(checkboxTracking: boolean) {
    const generateClientId = () => {
        const getRandomValue = () => Math.floor(Math.random() * 1e10);
        return `${getRandomValue()}.${getRandomValue()}`;
    };

    return {
        accepted: checkboxTracking,
        clientId: generateClientId(),
        userId: `user_${Date.now()}`,
        sessionId: Math.floor(Date.now() / 1000),
    };
}

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
    const [, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);
    const [{ value: acceptedTerms }, setAcceptedTerms] = useAtom(acceptedTermsAtom);
    const [, setActivityTracking] = useAtom(acceptedActivityTrackingAtom);
    const [, setUiStyle] = useAtom(uiStyleAtom);
    const [checkboxTerms, setCheckboxTerms] = useState(false);
    const [checkboxTracking, setCheckboxTracking] = useState(true);
    const config = useAsyncMemo(getTermsAndConditionsConfig, undefined, []);
    const nav = useNavigate();
    const navToPassword = () => {
        const version = config?.version || acceptedTerms?.version;
        // If we didn't find a version, put in an empty version
        setAcceptedTerms({ accepted: checkboxTerms, version: version || '', url: config?.url });

        setActivityTracking(createAnalyticsTrackingObject(checkboxTracking)).then(() => {
            appTracker.welcomeScreen();
            appTracker.welcomeActivityTrackingCheckBoxChecked();
            appTracker.welcomeTermAndConditionsCheckBoxChecked();
            appTracker.welcomeGetStartedClicked();
        });

        setUiStyle(UiStyle.WalletX);

        return nav(absoluteRoutes.onboarding.setupPassword.path);
    };

    useEffect(() => {
        bg?.classList.add('welcome-page');

        // needed for proper network handling during onboarding
        // otherwise failing with error 'Indexed storage should not be accessed before setting the network'
        setCurrentNetworkConfiguration(mainnet);
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
                <div className="welcome__check_group">
                    <Text.Capture>
                        <Checkbox checked={checkboxTerms} onChange={(e) => setCheckboxTerms(e.target.checked)} />
                        {t('proceeding')}
                        <ExternalLink path={urls.termsAndConditions}>{t('termsAndConditions')}</ExternalLink>
                    </Text.Capture>
                    <Text.Capture>
                        <Checkbox checked={checkboxTracking} onChange={(e) => setCheckboxTracking(e.target.checked)} />
                        {t('activityTracking')}
                    </Text.Capture>
                </div>
                <Button.Main
                    label={t('start')}
                    onClick={() => {
                        bg?.classList.remove('welcome-page');
                        navToPassword();
                    }}
                    disabled={!checkboxTerms}
                />
            </Page.Footer>
        </Page>
    );
}
