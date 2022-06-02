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

// Extend window object with the wallet API and the callback needed by the wallet.
declare global {
    interface Window {
        concordiumReady(): void;
        concordium: IWalletApi | undefined;
    }
}

// Module reference on testnet: 47ece1d6d52b02f7f91e9b5dd456883785643a357309154403776d8d7f958f9e
/** If you want to test smashing the piggy bank,
 * it will be necessary to instantiate your own piggy bank using an account available in the browser wallet,
 * and change this constant to match the index of the instance.
 */
const CONTRACT_INDEX = 5102n;
/** Should match the subindex of the instance targeted. */
const CONTRACT_SUB_INDEX = 0n;
const CONTRACT_NAME = 'PiggyBank';

/** This assumes a locally running JSON-RPC server targeting testnet: https://github.com/Concordium/concordium-json-rpc/tree/add-get-instance-info */
const client = new JsonRpcClient(new HttpProvider('http://localhost:9095'));

/** Promise resolves when callback is called from the extension, letting us know that the wallet API is ready for use. */
const apiReady = new Promise<void>((resolve) => {
    window.concordiumReady = resolve;
});

/**
 * Global application state.
 */
type State = {
    isConnected: boolean;
    account: string | undefined;
};

const state = createContext<State>({ isConnected: false, account: undefined });

/**
 * Action for depositing an amount of microCCD to the piggy bank instance
 */
const deposit = (amount = 0) => {
    if (window.concordium === undefined) {
        throw new Error('Concordium wallet API not accessible.');
    }

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

/**
 * Action for smashing the piggy bank. This is only possible to do, if the account sending the transaction matches the owner of the piggy bank:
 * https://github.com/Concordium/concordium-rust-smart-contracts/blob/c4d95504a51c15bdbfec503c9e8bf5e93a42e24d/examples/piggy-bank/part1/src/lib.rs#L64
 */
const smash = () => {
    if (window.concordium === undefined) {
        throw new Error('Concordium wallet API not accessible.');
    }

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
    const { account, isConnected } = useContext(state);
    const [piggybank, setPiggyBank] = useState<InstanceInfo>();
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Get piggy bank data.
        client.getInstanceInfo({ index: CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX }).then(setPiggyBank);
    }, []);

    return (
        <main>
            <div>{isConnected ? `Wallet connected: ${account}` : 'No wallet connection'}</div>
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
                <button type="button" onClick={() => deposit(input.current?.valueAsNumber)} disabled={!isConnected}>
                    Deposit
                </button>
            </label>
            <br />
            <br />
            <button
                type="button"
                onClick={() => smash()}
                disabled={account === undefined || account !== piggybank?.owner.address || !isConnected} // The smash button is only active for the contract owner.
            >
                Smash the piggy bank!
            </button>
        </main>
    );
}

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    const [account, setAccount] = useState<string>();
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        apiReady
            // Connect to the wallet.
            .then(() => window.concordium?.connect())
            .then((acc) => {
                // Connection accepted, set the application state parameters.
                setAccount(acc);
                setIsConnected(true);

                // Listen for relevent events from the wallet.
                window.concordium?.addChangeAccountListener(setAccount);
            })
            // Connection rejected.
            .catch(() => setIsConnected(false));
    }, []);

    const stateValue: State = useMemo(() => ({ isConnected, account }), [isConnected, account]);

    return (
        // Setup a globally accessible state with data from the wallet.
        <state.Provider value={stateValue}>
            <PiggyBank />
        </state.Provider>
    );
}
