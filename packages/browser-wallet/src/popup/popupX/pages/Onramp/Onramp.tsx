import React from 'react';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import { useAtomValue } from 'jotai';
import BanxaLogo from '@assets/svgX/banxa_logo.svg';
import PaymentIcon from '@assets/svgX/payment-icon.svg';
import ArrowPayment from '@assets/svgX/arrow-payment.svg';
import { selectedCredentialAtom } from '@popup/store/account';
import { networkConfigurationAtom } from '@popup/store/settings';
import { NetworkConfiguration } from '@shared/storage/types';
import { isMainnet } from '@shared/utils/network-helpers';
import urls from '@shared/constants/url';

const BANXA_CONFIG = {
    title: 'Banxa',
    productionUrl: 'https://concordium.banxa.com/',
    testUrl: 'https://concordium.banxa-sandbox.com/',
    getBaseUrl(network: NetworkConfiguration) {
        return isMainnet(network) ? this.productionUrl : this.testUrl;
    },
    getUrl(network: NetworkConfiguration, address: string) {
        const queryParams = {
            coinType: 'CCD',
            walletAddress: address,
            orderType: 'buy',
        };

        const queryString = new URLSearchParams(queryParams).toString();

        return `${this.getBaseUrl(network)}?${queryString}`;
    },
};

export default function Onramp() {
    const { t } = useTranslation('x', { keyPrefix: 'onramp' });
    const credential = useAtomValue(selectedCredentialAtom);

    if (credential === undefined) {
        return null;
    }

    const network = useAtomValue(networkConfigurationAtom);
    const url = BANXA_CONFIG.getUrl(network, credential.address);
    const handleClick = () => {
        window.open(url, '_blank');
    };

    return (
        <Page className="onramp">
            <Page.Main>
                <Page.Top heading={t('buyCCD')} />
                <Text.Capture className="text__description">{t('description')}</Text.Capture>
                <Card type="grey">
                    <button type="button" onClick={handleClick} className="banxa-link-btn" aria-label={t('continue')}>
                        <span className="banxa-link-btn__left">
                            <BanxaLogo className="banxa-link-btn__logo" />
                            <span className="banxa-link-btn__text">{BANXA_CONFIG.title}</span>
                        </span>
                        <PaymentIcon className="banxa-link-btn__payment" />
                        <ArrowPayment className="banxa-link-btn__arrow" />
                    </button>
                </Card>
                <Text.Capture className="text__description">
                    {t('supportedWallets')}
                    <Text.ExternalLink path={urls.websiteCcdWallet}>concordium.com/ccd-wallet</Text.ExternalLink>
                </Text.Capture>
                <Card type="grey">
                    <Text.Heading>Disclaimer</Text.Heading>
                    <Text.Capture>{t('disclaimer')}</Text.Capture>
                </Card>
            </Page.Main>
        </Page>
    );
}
