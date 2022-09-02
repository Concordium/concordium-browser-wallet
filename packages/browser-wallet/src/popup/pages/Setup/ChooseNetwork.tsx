import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { useSetAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { seedPhraseAtom } from '@popup/state';
import { networkConfigurationAtom } from '@popup/store/settings';
import { setupRoutes } from './routes';
// TODO Remove stagenet
import { mainnet, testnet, stagenet } from '../NetworkSettings/NetworkSettings';

export function ChooseNetwork() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const setNetworkConfiguration = useSetAtom(networkConfigurationAtom);
    // TODO Make a better way to check if we are recovering
    const isRecovering = !useAtomValue(seedPhraseAtom);

    const goToNext = () => {
        if (isRecovering) {
            navigate(`${absoluteRoutes.setup.path}/${setupRoutes.performRecovery}`);
        } else {
            navigate(absoluteRoutes.home.identities.path);
        }
    };

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
                            goToNext();
                        }}
                    >
                        Concordium Mainnet
                    </Button>
                    <Button
                        className="onboarding-setup__page-with-header__testnet-button"
                        width="wide"
                        onClick={() => {
                            setNetworkConfiguration(testnet);
                            goToNext();
                        }}
                    >
                        Concordium Testnet
                    </Button>
                    <Button
                        className="onboarding-setup__page-with-header__testnet-button"
                        width="wide"
                        onClick={() => {
                            setNetworkConfiguration(stagenet);
                            goToNext();
                        }}
                    >
                        Concordium Stagenet
                    </Button>
                </div>
            </div>
        </>
    );
}
