import React from 'react';
import Dot from '@assets/svgX/dot.svg';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';

export default function NetworkSettings() {
    const { t } = useTranslation('x', { keyPrefix: 'network' });
    const nav = useNavigate();
    const navToConnect = () => nav(relativeRoutes.settings.network.connect.path);
    return (
        <Page className="network-settings-x">
            <Page.Top heading={t('networkSettings')} />
            <Page.Main>
                <Card>
                    <Card.Row>
                        <Text.MainRegular>Concordium Mainnet</Text.MainRegular>
                        <Button.Secondary className="dark" label="Connected" icon={<Dot />} />
                    </Card.Row>
                    <Card.Row>
                        <Text.MainRegular>Concordium Testnet</Text.MainRegular>
                        <Button.Secondary className="dark" label="Connect" onClick={() => navToConnect()} />
                    </Card.Row>
                </Card>
            </Page.Main>
        </Page>
    );
}
