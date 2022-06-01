/* eslint-disable no-console */
import React, { useEffect, useState, createContext, useMemo, useContext, useRef } from 'react';
import type { IWalletApi } from '@concordium/browser-wallet-api';
import {
    AccountTransactionType,
    GtuAmount,
    HttpProvider,
    InstanceInfo,
    JsonRpcClient,
    UpdateContractPayload,
} from '@concordium/web-sdk';

declare global {
    interface Window {
        concordiumReady(): void;
        concordium: IWalletApi;
    }
}

// Module reference on testnet: 47ece1d6d52b02f7f91e9b5dd456883785643a357309154403776d8d7f958f9e
const CONTRACT_INDEX = 5102n;
const CONTRACT_SUB_INDEX = 0n;
const CONTRACT_NAME = 'PiggyBank';

const client = new JsonRpcClient(new HttpProvider('http://localhost:9095'));

const apiReady = new Promise<void>((resolve) => {
    window.concordiumReady = resolve;
});

type State = {
    isConnected: boolean;
    account: string | undefined;
};

const state = createContext<State>({ isConnected: false, account: undefined });

const deposit = (amount = 0) => {
    if (!Number.isInteger(amount) || amount <= 0) {
        return;
    }

    window.concordium
        .sendTransaction(AccountTransactionType.UpdateSmartContractInstance, {
            amount: new GtuAmount(BigInt(amount)),
            contractAddress: {
                index: CONTRACT_INDEX,
                subindex: CONTRACT_SUB_INDEX,
            },
            receiveName: `${CONTRACT_NAME}.insert`,
            maxContractExecutionEnergy: 30000n,
        } as UpdateContractPayload)
        .then((txHash) => console.log(`https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${txHash}`))
        .catch(alert);
};

const smash = () => {
    window.concordium
        .sendTransaction(AccountTransactionType.UpdateSmartContractInstance, {
            amount: new GtuAmount(0n), // This feels weird? Why do I need an amount for a non-payable receive?
            contractAddress: {
                index: CONTRACT_INDEX,
                subindex: CONTRACT_SUB_INDEX,
            },
            receiveName: `${CONTRACT_NAME}.smash`,
            maxContractExecutionEnergy: 30000n,
        } as UpdateContractPayload)
        .then((txHash) => console.log(`https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${txHash}`))
        .catch(alert);
};

function PiggyBank() {
    const { account } = useContext(state);
    const [piggybank, setPiggyBank] = useState<InstanceInfo>();
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        client.getInstanceInfo({ index: CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX }).then(setPiggyBank);
    }, []);

    return (
        <main>
            <div>Wallet account: {account}</div>
            <br />
            {piggybank === undefined ? (
                <div>Loading piggy bank...</div>
            ) : (
                <>
                    <h1>Stored CCD: {Number(piggybank?.amount.microGtuAmount) / 1000000}</h1>
                    <div>Owner account: {piggybank?.owner.address}</div>
                </>
            )}
            <br />
            <label>
                <div>Select amount to deposit (microCCD)</div>
                <input type="number" defaultValue={1} ref={input} />
                <button type="button" onClick={() => deposit(input.current?.valueAsNumber)}>
                    Deposit
                </button>
            </label>
            <br />
            <br />
            <button
                type="button"
                onClick={() => smash()}
                disabled={account === undefined || account !== piggybank?.owner.address} // The smash button is only active for the contract owner.
            >
                Smash the piggy bank!
            </button>
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
