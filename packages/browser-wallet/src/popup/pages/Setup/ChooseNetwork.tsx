import PageHeader from '@popup/shared/PageHeader';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { useSetAtom } from 'jotai';
import { jsonRpcUrlAtom } from '@popup/store/settings';

// TODO The real go-live values must be used here.
const mainnetJsonRpcUrl = 'http://localhost:9096';
const testnetJsonRpcUrl = 'http://localhost:9095';

export function ChooseNetwork() {
    const navigate = useNavigate();
    const setJsonRpcUrl = useSetAtom(jsonRpcUrlAtom);

    return (
        <>
            <PageHeader>Choose a network</PageHeader>
            <div className="choose-network">
                <div className="p-10">
                    <p>
                        Here you can choose whether to connect to the Concordium Mainnet or Testnet.{' '}
                        <i>If you are unsure what to choose, choose Concordium Mainnet.</i>
                    </p>
                    <p>You can choose another network via the Settings menu later.</p>
                </div>
                <div>
                    <Button
                        className="choose-network__mainnet-button"
                        width="wide"
                        onClick={() => {
                            setJsonRpcUrl(mainnetJsonRpcUrl);
                            navigate(absoluteRoutes.home.identities.path);
                        }}
                    >
                        Concordium Mainnet
                    </Button>
                    <Button
                        className="choose-network__testnet-button"
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
