import React from 'react';
import Dot from '@assets/svgX/dot.svg';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { mainnet, stagenet, testnet } from '@shared/constants/networkConfiguration';
import { isDevelopmentBuild } from '@shared/utils/environment-helpers';
import { useAtom } from 'jotai';
import { networkConfigurationAtom } from '@popup/store/settings';

function useNetworks() {
    const { t } = useTranslation('x', { keyPrefix: 'network' });
    const [currentNetworkConfiguration] = useAtom(networkConfigurationAtom);

    const networks = [mainnet, testnet];
    if (isDevelopmentBuild()) {
        networks.push(stagenet);
    }

    const updatedNetworks = networks.map((network) => {
        const isConnected = network.genesisHash === currentNetworkConfiguration.genesisHash;
        const connectLabel = isConnected ? t('connected') : t('connect');

        return {
            ...network,
            isConnected,
            connectLabel,
        };
    });

    return updatedNetworks;
}

export default function NetworkSettings() {
    const { t } = useTranslation('x', { keyPrefix: 'network' });
    const networks = useNetworks();

    const nav = useNavigate();
    const navToConnect = () => nav(relativeRoutes.settings.network.connect.path);

    return (
        <Page className="network-settings-x">
            <Page.Top heading={t('networkSettings')} />
            <Page.Main>
                <Card>
                    {networks.map((network) => (
                        <Card.Row>
                            <Text.MainRegular>{network.name}</Text.MainRegular>
                            <Button.Secondary
                                className="dark"
                                label={network.connectLabel}
                                icon={network.isConnected ? <Dot /> : null}
                                onClick={() => navToConnect()}
                            />
                        </Card.Row>
                    ))}
                </Card>
            </Page.Main>
        </Page>
    );
}
