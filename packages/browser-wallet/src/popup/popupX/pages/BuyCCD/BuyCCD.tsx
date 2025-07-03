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

export default function BuyCCD() {
    const { t } = useTranslation('x', { keyPrefix: 'buyCCD' });
    const credential = useAtomValue(selectedCredentialAtom);

    if (credential === undefined) {
        return null;
    }

    const network = useAtomValue(networkConfigurationAtom);

    const baseUrl =
        network.name === 'Concordium Mainnet'
            ? 'https://concordium.banxa.com/'
            : 'https://concordium.banxa-sandbox.com/';

    const queryParams = {
        coinType: 'CCD',
        walletAddress: credential.address,
        orderType: 'buy',
    };

    const queryString = new URLSearchParams(queryParams).toString();

    const url = `${baseUrl}?${queryString}`;

    const handleClick = () => {
        window.open(url, '_blank');
    };

    return (
        <Page className="buy-ccd">
            <Page.Main>
                <Page.Top heading={t('buyCCD')} />
                <Text.Capture className="text__description">{t('description')}</Text.Capture>
                <Card type="grey">
                    <button type="button" onClick={handleClick} className="banxa-link-btn" aria-label={t('continue')}>
                        <span className="banxa-link-btn__left">
                            <BanxaLogo className="banxa-link-btn__logo" />
                            <span className="banxa-link-btn__text">Banxa</span>
                        </span>
                        <PaymentIcon className="banxa-link-btn__payment" />
                        <ArrowPayment className="banxa-link-btn__arrow" />
                    </button>
                </Card>
                <Text.Capture className="text__description">
                    {t('supportedWallets')}
                    <Text.ExternalLink path="https://concordium.com/ccd-wallet">
                        concordium.com/ccd-wallet
                    </Text.ExternalLink>
                </Text.Capture>
                <Card type="grey">
                    <Text.Heading>Disclaimer</Text.Heading>
                    <Text.Capture>{t('disclaimer')}</Text.Capture>
                </Card>
            </Page.Main>
        </Page>
    );
}
