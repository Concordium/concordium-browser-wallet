import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { customNetworkConfigurationAtom, networkConfigurationAtom } from '@popup/store/settings';
import Page from '@popup/popupX/shared/Page';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import Dot from '@assets/svgX/dot.svg';
import { devnet, mainnet, stagenet, testnet } from '@shared/constants/networkConfiguration';
import { isDevelopmentBuild } from '@shared/utils/environment-helpers';
import { relativeRoutes } from '@popup/popupX/constants/routes';

function useNetworks() {
    const { t } = useTranslation('x', { keyPrefix: 'network' });
    const nav = useNavigate();
    const [currentNetworkConfiguration, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);
    const [customnet] = useAtom(customNetworkConfigurationAtom);
    const navToCustom = () =>
        nav(relativeRoutes.onboarding.welcome.setupPassword.createOrRestore.selectNetwork.custom.path);

    const networks = [mainnet, testnet];
    if (isDevelopmentBuild()) {
        networks.push(stagenet);
    }
    networks.push(devnet);
    networks.push(customnet);

    const updatedNetworks = networks.map((network) => {
        const isConnected = network.genesisHash === currentNetworkConfiguration.genesisHash;
        const connectLabel = isConnected ? t('connected') : t('connect');

        return {
            ...network,
            isConnected,
            connectLabel,
            setNetwork: () => setCurrentNetworkConfiguration(network),
            ...(network.name === customnet.name && { setNetwork: navToCustom }),
        };
    });

    return updatedNetworks;
}

export default function SelectNetwork() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.selectNetwork' });
    const networks = useNetworks();
    return (
        <Page className="select-network">
            <Page.Top heading={t('networkSettings')} />
            <Page.Main>
                <Card>
                    {networks.map((network) => (
                        <Card.Row key={network.name}>
                            <Text.MainRegular>{network.name}</Text.MainRegular>
                            <Button.Secondary
                                className="dark"
                                label={network.connectLabel}
                                icon={network.isConnected ? <Dot /> : null}
                                onClick={() => network.setNetwork()}
                            />
                        </Card.Row>
                    ))}
                </Card>
            </Page.Main>
        </Page>
    );
}
