import { useAtom } from 'jotai';
import React from 'react';
import { networkConfigurationAtom } from '@popup/store/settings';
import SidedRow from '@popup/shared/SidedRow';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';

import { NetworkConfiguration } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import { useTranslation } from 'react-i18next';
import { isMainnet, mainnetGenesisHash } from '@shared/utils/network-helpers';
import { pendingIdentityAtom } from '@popup/store/identity';
import Modal from '@popup/shared/Modal';
import { useNavigate } from 'react-router-dom';

export const mainnet: NetworkConfiguration = {
    genesisHash: mainnetGenesisHash,
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
    jsonRpcUrl: 'https://json-rpc.stagenet.concordium.com/',
    explorerUrl: 'https://wallet-proxy.stagenet.concordium.com',
};

function NetworkConfigurationComponent({ networkConfiguration }: { networkConfiguration: NetworkConfiguration }) {
    const { t } = useTranslation('networkSettings');
    const [currentNetworkConfiguration, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);
    const isConfigurationMainnet = isMainnet(networkConfiguration);

    if (networkConfiguration.genesisHash === currentNetworkConfiguration.genesisHash) {
        return (
            <div className="inline-flex align-center relative">
                <div
                    className={
                        isConfigurationMainnet
                            ? 'network-settings-page__element-mainnet'
                            : 'network-settings-page__element-testnet'
                    }
                >
                    {t('connected')}
                </div>
                <CheckmarkIcon
                    className={
                        isConfigurationMainnet
                            ? 'network-settings-page__icon-mainnet'
                            : 'network-settings-page__icon-testnet'
                    }
                />
            </div>
        );
    }

    return (
        <Button
            className={
                isConfigurationMainnet
                    ? 'network-settings-page__element-mainnet'
                    : 'network-settings-page__element-testnet'
            }
            clear
            onClick={() => setCurrentNetworkConfiguration(networkConfiguration)}
        >
            {t('connect')}
        </Button>
    );
}

export default function NetworkSettings() {
    const { t } = useTranslation('networkSettings');
    const [pendingIdentity, setPendingIdentity] = useAtom(pendingIdentityAtom);
    const nav = useNavigate();

    return (
        <div className="network-settings-page">
            <Modal disableClose open={Boolean(pendingIdentity)}>
                <div className="network-settings-page__pending-identity">
                    <p>{t('pendingIdentity.description')}</p>
                    <Button
                        width="medium"
                        className="network-settings-page__pending-identity__button"
                        onClick={() => nav(-1)}
                    >
                        {t('pendingIdentity.back')}
                    </Button>
                    <Button
                        faded
                        width="medium"
                        className="network-settings-page__pending-identity__button"
                        onClick={() => setPendingIdentity(undefined)}
                    >
                        {t('pendingIdentity.abort')}
                    </Button>
                </div>
            </Modal>
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
