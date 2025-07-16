import React from 'react';
import Dot from '@assets/svgX/dot.svg';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { devnet, mainnet, stagenet, testnet } from '@shared/constants/networkConfiguration';
import { isDevelopmentBuild } from '@shared/utils/environment-helpers';
import { useAtom } from 'jotai';
import { networkConfigurationAtom, customNetworkConfigurationAtom } from '@popup/store/settings';

function useNetworks() {
    const { t } = useTranslation('x', { keyPrefix: 'network' });
    const [currentNetworkConfiguration] = useAtom(networkConfigurationAtom);
    const [customnet] = useAtom(customNetworkConfigurationAtom);

    const networks = [mainnet, testnet, devnet];
    if (isDevelopmentBuild()) {
        networks.push(stagenet);
    }
    networks.push(customnet);

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
    const navToConnect = (genesisHash: string) =>
        nav(relativeRoutes.settings.network.connect.path.replace(':genesisHash', genesisHash));
    const navToCustom = () => nav(relativeRoutes.settings.network.custom.path);
    const getNavPath = (idx: number, arrLength: number, genesisHash: string) => {
        if (idx === arrLength - 1) {
            return navToCustom();
        }
        return navToConnect(genesisHash);
    };

    return (
        <Page className="network-settings-x">
            <Page.Top heading={t('networkSettings')} />
            <Page.Main>
                <Card>
                    {networks.map((network, idx, array) => (
                        <Card.Row key={network.name}>
                            <Text.MainRegular>{network.name}</Text.MainRegular>
                            <Button.Secondary
                                className="dark"
                                label={network.connectLabel}
                                icon={network.isConnected ? <Dot /> : null}
                                onClick={() => getNavPath(idx, array.length, network.genesisHash)}
                            />
                        </Card.Row>
                    ))}
                </Card>
            </Page.Main>
        </Page>
    );
}
