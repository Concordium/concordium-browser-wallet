import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { useSetAtom } from 'jotai';
import { jsonRpcUrlAtom } from '@popup/store/settings';
import { useTranslation } from 'react-i18next';

// TODO The real go-live values must be used here.
const mainnetJsonRpcUrl = 'http://localhost:9096';
const testnetJsonRpcUrl = 'http://localhost:9095';

export function ChooseNetwork() {
    const navigate = useNavigate();
    const { t } = useTranslation('setup');
    const setJsonRpcUrl = useSetAtom(jsonRpcUrlAtom);

    return (
        <>
            <PageHeader>Choose a network</PageHeader>
            <div className="page-with-header">
                <div className="page-with-header__description">
                    <p>
                        {t('chooseNetwork.descriptionP1')} <i>{t('chooseNetwork.descriptionP2')}</i>
                    </p>
                    <p>{t('chooseNetwork.descriptionP3')}</p>
                </div>
                <div>
                    <Button
                        className="page-with-header__mainnet-button"
                        width="wide"
                        onClick={() => {
                            setJsonRpcUrl(mainnetJsonRpcUrl);
                            navigate(absoluteRoutes.home.identities.path);
                        }}
                    >
                        Concordium Mainnet
                    </Button>
                    <Button
                        className="page-with-header__testnet-button"
                        width="wide"
                        onClick={() => {
                            setJsonRpcUrl(testnetJsonRpcUrl);
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
