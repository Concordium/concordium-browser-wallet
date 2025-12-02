import React, { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { networkConfigurationAtom, sessionOnboardingLocationAtom, uiStyleAtom } from '@popup/store/settings';
import { mainnet } from '@shared/constants/networkConfiguration';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Page from '@popup/popupX/shared/Page';
import { UiStyle } from '@shared/storage/types';
import FullLogo from '@assets/svgX/UiKit/Custom/concordium-full-logo.svg';
import LandingImg from '@assets/svgX/UiKit/Custom/graphic-landing-3.svg';

export default function Intro() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.intro' });
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const setCurrentNetworkConfiguration = useSetAtom(networkConfigurationAtom);
    const setUiStyle = useSetAtom(uiStyleAtom);
    const nav = useNavigate();
    const navToWelcome = () => {
        const pathToWelcome = absoluteRoutes.onboarding.welcome.path;
        setUiStyle(UiStyle.WalletX);
        setOnboardingLocation(pathToWelcome);
        return nav(pathToWelcome);
    };

    useEffect(() => {
        // needed for proper network handling during onboarding
        // otherwise failing with error 'Indexed storage should not be accessed before setting the network'
        setCurrentNetworkConfiguration(mainnet);
    }, []);

    return (
        <Page className="intro">
            <Page.Main>
                <FullLogo className="full-logo" />
                <Text.MainMedium>{t('smartMoney')}</Text.MainMedium>
                <LandingImg className="landing-img" />
                <Text.Heading>{t('dataRules')}</Text.Heading>
                <Text.MainRegular>{t('verify')}</Text.MainRegular>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    label={t('continue')}
                    onClick={() => {
                        navToWelcome();
                    }}
                />
            </Page.Footer>
        </Page>
    );
}
