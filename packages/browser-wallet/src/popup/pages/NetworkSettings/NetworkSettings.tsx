import { useAtom } from 'jotai';
import React from 'react';
import { networkConfigurationAtom } from '@popup/store/settings';
import SidedRow from '@popup/shared/SidedRow';
import CheckmarkIconMainnet from '@assets/svg/checkmark-blue.svg';
import CheckmarkIconTestnet from '@assets/svg/checkmark-dark-green.svg';

import { NetworkConfiguration } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import clsx from 'clsx';

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
    const [currentNetworkConfiguration, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);

    if (networkConfiguration.genesisHash === currentNetworkConfiguration.genesisHash) {
        return (
            <div className="inline-flex align-center relative">
                <div
                    className={clsx(
                        networkConfiguration.genesisHash === mainnet.genesisHash
                            ? 'network-settings-page__element-mainnet'
                            : 'network-settings-page__element-testnet'
                    )}
                >
                    Connected
                </div>
                {isMainnet(networkConfiguration) ? (
                    <CheckmarkIconMainnet className="network-settings-page__icon" />
                ) : (
                    <CheckmarkIconTestnet className="network-settings-page__icon" />
                )}
            </div>
        );
    }

    return (
        <Button
            className={clsx(
                networkConfiguration.genesisHash === mainnet.genesisHash
                    ? 'network-settings-page__element-mainnet'
                    : 'network-settings-page__element-testnet'
            )}
            clear
            onClick={() => setCurrentNetworkConfiguration(networkConfiguration)}
        >
            Connect
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
