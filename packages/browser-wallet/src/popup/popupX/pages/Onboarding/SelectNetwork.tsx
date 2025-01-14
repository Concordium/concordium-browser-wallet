import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { networkConfigurationAtom } from '@popup/store/settings';
import Page from '@popup/popupX/shared/Page';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import Dot from '@assets/svgX/dot.svg';
import { mainnet, stagenet, testnet } from '@shared/constants/networkConfiguration';
import { isDevelopmentBuild } from '@shared/utils/environment-helpers';

function useNetworks() {
    const { t } = useTranslation('x', { keyPrefix: 'network' });
    const [currentNetworkConfiguration, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);

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
            setNetwork: () => setCurrentNetworkConfiguration(network),
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
