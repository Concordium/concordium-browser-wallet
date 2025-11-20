import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { acceptedTermsAtom, sessionOnboardingLocationAtom } from '@popup/store/settings';
import ArrowRight from '@assets/svgX/UiKit/Arrows/arrow-right.svg';
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
import FullLogo from '@assets/svgX/UiKit/Custom/concordium-full-logo.svg';
import LandingImg from '@assets/svgX/UiKit/Custom/graphic-landing-4.svg';

export default function Welcome() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.welcome' });
    const setOnboardingLocation = useSetAtom(sessionOnboardingLocationAtom);
    const [{ value: acceptedTerms }, setAcceptedTerms] = useAtom(acceptedTermsAtom);
    const config = useAsyncMemo(getTermsAndConditionsConfig, undefined, []);
    const nav = useNavigate();
    const navToPassword = () => {
        const version = config?.version || acceptedTerms?.version;
        // If we didn't find a version, put in an empty version
        setAcceptedTerms({ accepted: true, version: version || '', url: config?.url });

        const pathToPassword = absoluteRoutes.onboarding.welcome.setupPassword.path;
        setOnboardingLocation(pathToPassword);
        return nav(pathToPassword);
    };

    return (
        <Page className="welcome">
            <Page.Main>
                <FullLogo className="full-logo" />
                <Text.MainMedium>{t('smartMoney')}</Text.MainMedium>
                <LandingImg className="landing-img" />
                <Text.Heading>{t('speed')}</Text.Heading>
                <Text.MainRegular>{t('fastPayments')}</Text.MainRegular>
                <Text.Capture>
                    {t('proceeding')}
                    <ExternalLink path={urls.termsAndConditions}>{t('termsAndConditions')}</ExternalLink>
                </Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    label={t('start')}
                    iconRight={<ArrowRight />}
                    onClick={() => {
                        navToPassword();
                    }}
                />
            </Page.Footer>
        </Page>
    );
}
