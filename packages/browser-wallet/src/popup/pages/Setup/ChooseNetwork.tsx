import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { hasBeenOnBoardedAtom, networkConfigurationAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { mainnet, testnet, stagenet } from '@shared/constants/networkConfiguration';
import { NetworkConfiguration } from '@shared/storage/types';
import { isDevelopmentBuild } from '@shared/utils/environment-helpers';
import { setupRoutes } from './routes';
import { usePasscodeInSetup } from './passcode-helper';

interface NetworkButtonProps {
    text: string;
    network: NetworkConfiguration;
    className: string;
    isRecovering: boolean;
}

function NetworkButton({ text, network, className, isRecovering }: NetworkButtonProps) {
    const navigate = useNavigate();
    const setNetworkConfiguration = useSetAtom(networkConfigurationAtom);
    const setHasBeenOnboarded = useSetAtom(hasBeenOnBoardedAtom);
    const passcode = usePasscodeInSetup();
    const setPasscodeInSession = useSetAtom(sessionPasscodeAtom);

    const goToNext = () => {
        setPasscodeInSession(passcode);
        setHasBeenOnboarded(true);
        if (isRecovering) {
            navigate(`${absoluteRoutes.setup.path}/${setupRoutes.performRecovery}`);
        } else {
            navigate(absoluteRoutes.home.identities.path);
        }
    };

    return (
        <Button
            className={className}
            width="wide"
            onClick={async () => {
                await setNetworkConfiguration(network);
                goToNext();
            }}
        >
            {text}
        </Button>
    );
}

export function ChooseNetwork() {
    const location = useLocation();
    const isRecovering = location.pathname.endsWith('recovering');
    const { t } = useTranslation('setup');

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
                                {t('chooseNetwork.restore.descriptionP1')}{' '}
                                <i>{t('chooseNetwork.restore.descriptionP2')}</i>
                            </p>
                            <p>{t('chooseNetwork.restore.descriptionP3')}</p>
                        </>
                    )}
                </div>
                <div>
                    <NetworkButton
                        text="Concordium Mainnet"
                        className="onboarding-setup__page-with-header__mainnet-button"
                        network={mainnet}
                        isRecovering={isRecovering}
                    />
                    <NetworkButton
                        text="Concordium Testnet"
                        className="onboarding-setup__page-with-header__testnet-button"
                        network={testnet}
                        isRecovering={isRecovering}
                    />
                    {isDevelopmentBuild() && (
                        <NetworkButton
                            text="Concordium Stagenet"
                            className="onboarding-setup__page-with-header__testnet-button"
                            network={stagenet}
                            isRecovering={isRecovering}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
