import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { hasBeenOnBoardedAtom, networkConfigurationAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { mainnet, testnet } from '@shared/constants/networkConfiguration';
import { setupRoutes } from './routes';
import { usePasscodeInSetup } from './passcode-helper';

export function ChooseNetwork() {
    const navigate = useNavigate();
    const location = useLocation();
    const isRecovering = location.pathname.endsWith('recovering');
    const { t } = useTranslation('setup');
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
                    <Button
                        className="onboarding-setup__page-with-header__mainnet-button"
                        width="wide"
                        onClick={async () => {
                            await setNetworkConfiguration(mainnet);
                            goToNext();
                        }}
                    >
                        Concordium Mainnet
                    </Button>
                    <Button
                        className="onboarding-setup__page-with-header__testnet-button"
                        width="wide"
                        onClick={async () => {
                            await setNetworkConfiguration(testnet);
                            goToNext();
                        }}
                    >
                        Concordium Testnet
                    </Button>
                </div>
            </div>
        </>
    );
}
