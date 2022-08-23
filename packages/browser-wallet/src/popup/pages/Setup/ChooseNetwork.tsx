import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { networkConfigurationAtom } from '@popup/store/settings';
import { mainnet, testnet } from '../NetworkSettings/NetworkSettings';

export function ChooseNetwork() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const setNetworkConfiguration = useSetAtom(networkConfigurationAtom);

    return (
        <>
            <PageHeader>Choose a network</PageHeader>
            <div className="onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">
                    <p>
                        {t('chooseNetwork.descriptionP1')} <i>{t('chooseNetwork.descriptionP2')}</i>
                    </p>
                    <p>{t('chooseNetwork.descriptionP3')}</p>
                </div>
                <div>
                    <Button
                        className="onboarding-setup__page-with-header__mainnet-button"
                        width="wide"
                        onClick={() => {
                            setNetworkConfiguration(mainnet);
                            navigate(absoluteRoutes.home.identities.path);
                        }}
                    >
                        Concordium Mainnet
                    </Button>
                    <Button
                        className="onboarding-setup__page-with-header__testnet-button"
                        width="wide"
                        onClick={() => {
                            setNetworkConfiguration(testnet);
                            navigate(absoluteRoutes.home.identities.path);
                        }}
                    >
                        Concordium Testnet
                    </Button>
                </div>
            </div>
        </>
    );
}
