import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { useSetAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { isRecoveringAtom } from '@popup/state';
import { networkConfigurationAtom } from '@popup/store/settings';
import { setupRoutes } from './routes';
// TODO Remove stagenet
import { mainnet, testnet, stagenet } from '../NetworkSettings/NetworkSettings';

export function ChooseNetwork() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const setNetworkConfiguration = useSetAtom(networkConfigurationAtom);
    const isRecovering = useAtomValue(isRecoveringAtom);

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
                    {!isRecovering && (
                        <>
                            <p>
                                {t('chooseNetwork.create.descriptionP1')}{' '}
                                <i>{t('chooseNetwork.create.descriptionP2')}</i>
                            </p>
                            <p>{t('chooseNetwork.create.descriptionP3')}</p>
                        </>
                    )}
                    {isRecovering && (
                        <>
                            <p>
                                {t('chooseNetwork.create.descriptionP1')}{' '}
                                <i>{t('chooseNetwork.create.descriptionP2')}</i>
                            </p>
                            <p>{t('chooseNetwork.create.descriptionP3')}</p>
                        </>
                    )}
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
