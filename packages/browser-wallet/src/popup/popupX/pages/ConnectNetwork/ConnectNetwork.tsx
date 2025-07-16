import React from 'react';
import { useParams } from 'react-router-dom';
import Lock from '@assets/svgX/lock.svg';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { useAtom } from 'jotai';
import { networkConfigurationAtom } from '@popup/store/settings';
import { devnet, mainnet, stagenet, testnet } from '@shared/constants/networkConfiguration';

function useConnectNetwork(genesisHash: string) {
    const [currentNetworkConfiguration, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);
    const networks = {
        [mainnet.genesisHash]: mainnet,
        [testnet.genesisHash]: testnet,
        [stagenet.genesisHash]: stagenet,
        [devnet.genesisHash]: devnet,
    };

    return {
        name: networks[genesisHash].name,
        isConnected: networks[genesisHash].genesisHash === currentNetworkConfiguration.genesisHash,
        connectNetwork: () => setCurrentNetworkConfiguration(networks[genesisHash]),
    };
}

type Params = {
    genesisHash: string;
};

export default function ConnectNetwork() {
    const { t } = useTranslation('x', { keyPrefix: 'connect' });
    const { genesisHash = '' } = useParams<Params>();
    const { name, isConnected, connectNetwork } = useConnectNetwork(genesisHash);

    return (
        <Page className="connect-network-x">
            <Page.Top heading={t('connectNetwork')} />
            <Page.Main>
                <Text.MainRegular>{t('networkName')}</Text.MainRegular>
                <Text.MainMedium>
                    {name} {isConnected && <Lock />}
                </Text.MainMedium>
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('connect')} onClick={connectNetwork} />
            </Page.Footer>
        </Page>
    );
}
