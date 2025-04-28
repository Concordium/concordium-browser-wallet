import React, { ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { acceptedTermsAtom, networkConfigurationAtom, uiStyleAtom } from '@popup/store/settings';
import { testnet } from '@shared/constants/networkConfiguration';
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
    const [, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);
    const [{ value: acceptedTerms }, setAcceptedTerms] = useAtom(acceptedTermsAtom);
    const [, setUiStyle] = useAtom(uiStyleAtom);
    const config = useAsyncMemo(getTermsAndConditionsConfig, undefined, []);
    const nav = useNavigate();
    const navToPassword = () => {
        const version = config?.version || acceptedTerms?.version;
        // If we didn't find a version, put in an empty version
        setAcceptedTerms({ accepted: true, version: version || '', url: config?.url });

        setUiStyle(UiStyle.WalletX);

        return nav(absoluteRoutes.onboarding.setupPassword.path);
    };

    useEffect(() => {
        bg?.classList.add('welcome-page');

        // needed for proper network handling during onboarding
        // otherwise failing with error 'Indexed storage should not be accessed before setting the network'
        setCurrentNetworkConfiguration(testnet); //changed from mainnet MANI
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
