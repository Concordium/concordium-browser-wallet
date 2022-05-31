import React, { useEffect, useState, createContext, useMemo, useContext } from 'react';
import type { IWalletApi } from '@concordium/browser-wallet-api';

declare global {
    interface Window {
        concordiumReady(): void;
        concordium: IWalletApi;
    }
}

const apiReady = new Promise<void>((resolve) => {
    window.concordiumReady = resolve;
});

type State = {
    isConnected: boolean;
    account: string | undefined;
};

const state = createContext<State>({ isConnected: false, account: undefined });

function PiggyBank() {
    const { account } = useContext(state);

    return <main>Selected account: {account}</main>;
}

export default function Root() {
    const [hasApi, setHasApi] = useState<boolean>(false);
    const [account, setAccount] = useState<string>();
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        apiReady
            .then(() => {
                setHasApi(true);
            })
            .then(() => window.concordium.connect())
            .then((acc) => {
                setAccount(acc);
                setIsConnected(true);

                window.concordium.addChangeAccountListener(setAccount);
            });
    }, []);

    const stateValue: State = useMemo(() => ({ isConnected, account }), [isConnected, account]);

    if (!hasApi) {
        return <>API not ready...</>;
    }

    return (
        <state.Provider value={stateValue}>
            <PiggyBank />
        </state.Provider>
    );
}
