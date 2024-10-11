import React from 'react';
import Lock from '@assets/svgX/lock.svg';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';

export default function ConnectNetwork() {
    const { t } = useTranslation('x', { keyPrefix: 'connect' });

    return (
        <Page className="connect-network-x">
            <Page.Top heading={t('connectNetwork')} />
            <Page.Main>
                <Text.MainRegular>{t('networkName')}</Text.MainRegular>
                <Text.MainMedium>
                    Concordium Mainnet <Lock />
                </Text.MainMedium>
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('connect')} />
            </Page.Footer>
        </Page>
    );
}
