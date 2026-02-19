import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { getTransakOnRamp } from '@popup/shared/utils/wallet-proxy';
import Button, { ButtonProps } from '@popup/popupX/shared/Button/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import { useAtomValue } from 'jotai';
import BanxaLogo from '@assets/svgX/banxa_logo.svg';
import TransakLogo from '@assets/svgX/transak_logo.svg';
import ExternalLink from '@assets/svgX/UiKit/Interface/external-link.svg';
import { selectedCredentialAtom } from '@popup/store/account';
import { networkConfigurationAtom } from '@popup/store/settings';
import { NetworkConfiguration } from '@shared/storage/types';
import { isMainnet } from '@shared/utils/network-helpers';
import urls from '@shared/constants/url';

const BANXA_CONFIG = {
    title: 'Banxa',
    Logo: BanxaLogo,
    getUrl: (address: string, network: NetworkConfiguration) => {
        const productionUrl = 'https://concordium.banxa.com/';
        const testUrl = 'https://concordium.banxa-sandbox.com/';

        const baseUrl = isMainnet(network) ? productionUrl : testUrl;

        const queryParams = {
            coinType: 'CCD',
            walletAddress: address,
            orderType: 'buy',
        };

        const queryString = new URLSearchParams(queryParams).toString();

        return `${baseUrl}?${queryString}`;
    },
};

const TRANSAK_CONFIG = {
    title: 'Transak',
    Logo: TransakLogo,
    getUrl: async (accountAddress: string) => {
        const { widgetUrl } = await getTransakOnRamp(accountAddress);
        return widgetUrl;
    },
};

const ON_RAMP_LIST = [BANXA_CONFIG, TRANSAK_CONFIG];

function OnRampOption({ logo, title, className, ...props }: { logo: ReactNode; title: string } & ButtonProps) {
    return (
        <Button.Base className={clsx('button__on-ramp-option', className)} {...props}>
            <div className="icon-container">{logo}</div>
            <div className="text-container">
                <Text.MainMedium>{title}</Text.MainMedium>
            </div>
            <div className="external-link-icon">
                <ExternalLink />
            </div>
        </Button.Base>
    );
}

export default function Onramp() {
    const { t } = useTranslation('x', { keyPrefix: 'onramp' });
    const credential = useAtomValue(selectedCredentialAtom);
    const network = useAtomValue(networkConfigurationAtom);

    if (credential === undefined) {
        return null;
    }

    const handleClick =
        (getUrl: (address: string, network: NetworkConfiguration) => string | Promise<string>) => async () => {
            const providerUrl = await getUrl(credential.address, network);
            window.open(providerUrl, '_blank');
        };

    return (
        <Page className="onramp">
            <Page.Top heading={t('buyCCD')} />
            <Page.Main>
                <div className="description-section">
                    <Text.Capture className="text__description">{t('description')}</Text.Capture>
                    <Text.Capture className="text__description underline">{t('readDisclaimer')}</Text.Capture>
                </div>
                <div className="onramp_providers">
                    {ON_RAMP_LIST.map(({ title, Logo, getUrl }) => (
                        <OnRampOption key={title} title={title} logo={<Logo />} onClick={handleClick(getUrl)} />
                    ))}
                </div>
                <Text.Capture className="text__description">
                    {t('supportedWallets')}
                    <Text.ExternalLink path={urls.websiteCcdWallet}>{t('ccdWalletLinks')}</Text.ExternalLink>
                </Text.Capture>
                <Card type="transparent">
                    <Text.Heading>{t('disclaimer')}</Text.Heading>
                    <Text.Capture>
                        <Trans
                            t={t}
                            i18nKey="disclaimerText"
                            components={{
                                '1': <Text.ExternalLink path="https://www.fca.org.uk" />,
                            }}
                        />
                    </Text.Capture>
                </Card>
            </Page.Main>
        </Page>
    );
}
