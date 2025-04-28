import { useAtom } from 'jotai';
import React from 'react';
import { networkConfigurationAtom } from '@popup/store/settings';
import SidedRow from '@popup/shared/SidedRow';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';

import { NetworkConfiguration } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import { useTranslation } from 'react-i18next';
import { isMainnet } from '@shared/utils/network-helpers';
import { pendingIdentityAtom } from '@popup/store/identity';
import Modal from '@popup/shared/Modal';
import { useNavigate } from 'react-router-dom';
import { mainnet, testnet, stagenet } from '@shared/constants/networkConfiguration';
import { isDevelopmentBuild } from '@shared/utils/environment-helpers';

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

    const networks = [mainnet, testnet];
    if (isDevelopmentBuild()) {
        networks.push(stagenet);
    }

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
                {networks.map((network) => {
                    return (
                        <SidedRow
                            key={network.genesisHash}
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
