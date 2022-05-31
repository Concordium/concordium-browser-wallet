import React, { useEffect, useState, createContext, useMemo, useContext } from 'react';
import type { IWalletApi } from '@concordium/browser-wallet-api';
import { HttpProvider, JsonRpcClient } from '@concordium/web-sdk';

declare global {
    interface Window {
        concordiumReady(): void;
        concordium: IWalletApi;
    }
}

const CONTRACT_INDEX = 0n;
const CONTRACT_SUB_INDEX = 0n;

const client = new JsonRpcClient(new HttpProvider('http://127.0.0.1:9095'));

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
    const [ownerAccount, setOwnerAccount] = useState<string>();

    useEffect(() => {
        client.getInstanceInfo({ index: CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX }).then((res) => {
            // eslint-disable-next-line no-console
            console.log(res);
            setOwnerAccount(res?.owner.address);
        });
    }, []);

    return (
        <main>
            <div>Wallet account: {account}</div>
            <div>Contract owner account: {ownerAccount}</div>
        </main>
    );
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
