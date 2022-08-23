import { useAtom } from 'jotai';
import React from 'react';
import { networkConfigurationAtom } from '@popup/store/settings';
import SidedRow from '@popup/shared/SidedRow';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';

import { NetworkConfiguration } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const mainnet: NetworkConfiguration = {
    genesisHash: '9dd9ca4d19e9393877d2c44b70f89acbfc0883c2243e5eeaecc0d1cd0503f478',
    name: 'Concordium Mainnet',
    jsonRpcUrl: 'https://json-rpc.concordium.software',
    explorerUrl: 'https://wallet-proxy.mainnet.concordium.software',
};

export const testnet: NetworkConfiguration = {
    genesisHash: '4221332d34e1694168c2a0c0b3fd0f273809612cb13d000d5c2e00e85f50f796',
    name: 'Concordium Testnet',
    jsonRpcUrl: 'https://json-rpc.testnet.concordium.com/',
    explorerUrl: 'https://wallet-proxy.testnet.concordium.com',
};

// TODO Remove before go-live. Used for easy internal testing.
export const stagenet: NetworkConfiguration = {
    genesisHash: '38bf770b4c247f09e1b62982bb71000c516480c5a2c5214dadac6da4b1ad50e5',
    name: 'Concordium Stagenet',
    jsonRpcUrl: 'http://localhost:9095',
    explorerUrl: 'https://wallet-proxy.stagenet.concordium.com',
};

function isMainnet(network: NetworkConfiguration) {
    return network.genesisHash === mainnet.genesisHash;
}

function NetworkConfigurationComponent({ networkConfiguration }: { networkConfiguration: NetworkConfiguration }) {
    const { t } = useTranslation('networkSettings');
    const [currentNetworkConfiguration, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);
    const isConfigurationMainnet = isMainnet(networkConfiguration);

    if (networkConfiguration.genesisHash === currentNetworkConfiguration.genesisHash) {
        return (
            <div className="inline-flex align-center relative">
                <div
                    className={clsx(
                        isConfigurationMainnet
                            ? 'network-settings-page__element-mainnet'
                            : 'network-settings-page__element-testnet'
                    )}
                >
                    {t('connected')}
                </div>
                {isMainnet(networkConfiguration) ? (
                    <CheckmarkIcon className="network-settings-page__icon-mainnet" />
                ) : (
                    <CheckmarkIcon className="network-settings-page__icon-testnet" />
                )}
            </div>
        );
    }

    return (
        <Button
            className={clsx(
                isConfigurationMainnet
                    ? 'network-settings-page__element-mainnet'
                    : 'network-settings-page__element-testnet'
            )}
            clear
            onClick={() => setCurrentNetworkConfiguration(networkConfiguration)}
        >
            {t('connect')}
        </Button>
    );
}

export default function NetworkSettings() {
    return (
        <div className="network-settings-page">
            <div className="network-settings-page__list">
                {[mainnet, testnet, stagenet].map((network) => {
                    return (
                        <SidedRow
                            className="network-settings-page__element"
                            left={network.name}
                            right={<NetworkConfigurationComponent networkConfiguration={network} />}
                        />
                    );
                })}
            </div>
        </div>
    );
}
