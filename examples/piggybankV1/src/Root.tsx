/* eslint-disable no-console */
import React, { useEffect, useState, createContext, useMemo, useContext, useRef } from 'react';
import {
    AccountTransactionType,
    GtuAmount,
    HttpProvider,
    JsonRpcClient,
    toBuffer,
    UpdateContractPayload,
} from '@concordium/web-sdk';

import { WalletApi } from '@concordium/browser-wallet-api-types';
import PiggyIcon from './assets/piggy-bank-solid.svg';
import HammerIcon from './assets/hammer-solid.svg';

// V1 Module reference on testnet: 12362dd6f12fabd95959cafa27e512805161467b3156c7ccb043318cd2478838
const CONTRACT_INDEX = 81n; // V1 instance

// V0 Module reference on testnet: c0e51cd55ccbff4fa8da9bb76c9917e83ae8286d86b47647104bf715b4821c1a
/** If you want to test smashing the piggy bank,
 * it will be necessary to instantiate your own piggy bank using an account available in the browser wallet,
 * and change this constant to match the index of the instance.
 */
// const CONTRACT_INDEX = 6n; // V0 instance
/** Should match the subindex of the instance targeted. */
const CONTRACT_SUB_INDEX = 0n;
const CONTRACT_NAME = 'PiggyBank';

/** This assumes a locally running JSON-RPC server targeting testnet: https://github.com/Concordium/concordium-json-rpc/tree/add-get-instance-info */
const JSON_RPC_URL = 'http://localhost:9095';

const client = new JsonRpcClient(new HttpProvider(JSON_RPC_URL));

/**
 * Promise resolves to the Concordium provider when it has been successfully injected into
 * the window and is ready for use.
 * @param timeout determines how long to wait before rejecting if the Concordium provider is not available, in milliseconds.
 * @returns a promise containing the Concordium Wallet provider API.
 */
// TODO This function should be made available from the web-sdk for ease of use.
async function detectConcordiumProvider(timeout = 5000): Promise<WalletApi> {
    return new Promise((resolve, reject) => {
        if (window.concordium) {
            resolve(window.concordium);
        } else {
            const t = setTimeout(() => {
                if (window.concordium) {
                    resolve(window.concordium);
                } else {
                    reject();
                }
            }, timeout);
            window.addEventListener(
                'concordium#initialized',
                () => {
                    if (window.concordium) {
                        clearTimeout(t);
                        resolve(window.concordium);
                    }
                },
                { once: true }
            );
        }
    });
}

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
    if (!Number.isInteger(amount) || amount <= 0) {
        return;
    }

    detectConcordiumProvider()
        .then((provider) => {
            provider
                .sendTransaction(AccountTransactionType.UpdateSmartContractInstance, {
                    amount: new GtuAmount(BigInt(amount)),
                    contractAddress: {
                        index: CONTRACT_INDEX,
                        subindex: CONTRACT_SUB_INDEX,
                    },
                    receiveName: `${CONTRACT_NAME}.insert`,
                    maxContractExecutionEnergy: 30000n,
                } as UpdateContractPayload)
                .then((txHash) =>
                    console.log(`https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${txHash}`)
                )
                .catch(alert);
        })
        .catch(() => {
            throw new Error('Concordium Wallet API not accessible');
        });
};

/**
 * Action for smashing the piggy bank. This is only possible to do, if the account sending the transaction matches the owner of the piggy bank:
 * https://github.com/Concordium/concordium-rust-smart-contracts/blob/c4d95504a51c15bdbfec503c9e8bf5e93a42e24d/examples/piggy-bank/part1/src/lib.rs#L64
 */
const smash = () => {
    detectConcordiumProvider()
        .then((provider) => {
            provider
                .sendTransaction(AccountTransactionType.UpdateSmartContractInstance, {
                    amount: new GtuAmount(0n), // This feels weird? Why do I need an amount for a non-payable receive?
                    contractAddress: {
                        index: CONTRACT_INDEX,
                        subindex: CONTRACT_SUB_INDEX,
                    },
                    receiveName: `${CONTRACT_NAME}.smash`,
                    maxContractExecutionEnergy: 30000n,
                } as UpdateContractPayload)
                .then((txHash) =>
                    console.log(`https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${txHash}`)
                )
                .catch(alert);
        })
        .catch(() => {
            throw new Error('Concordium Wallet API not accessible');
        });
};

function updateState(setSmashed: (x: boolean) => void, setAmount: (x: bigint) => void) {
    client
        .invokeContract({
            method: `${CONTRACT_NAME}.view`,
            contract: { index: CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        })
        .then((res) => {
            if (!res || res.tag === 'failure' || !res.returnValue) {
                throw new Error(`Expected succesful invocation`);
            }
            setSmashed(!!Number(res.returnValue.substring(0, 2)));
            setAmount(toBuffer(res.returnValue.substring(2), 'hex').readBigUInt64LE(0));
        });
}

function PiggyBank() {
    const { account, isConnected } = useContext(state);
    const [owner, setOwner] = useState<string>();
    const [smashed, setSmashed] = useState<boolean>();
    const [amount, setAmount] = useState<bigint>(0n);
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Get piggy bank owner.
        client.getInstanceInfo({ index: CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX }).then((info) => {
            if (info?.name !== `init_${CONTRACT_NAME}`) {
                // Check that we have the expected instance.
                throw new Error(`Expected instance of PiggyBank: ${info?.name}`);
            }

            setOwner(info.owner.address);
        });
    }, []);

    // The internal state of the piggy bank, which is either intact or smashed.
    useEffect(() => {
        updateState(setSmashed, setAmount);
    }, []);

    // Disable use if we're not connected or if piggy bank has already been smashed.
    const canUse = isConnected && smashed !== undefined && !smashed;

    return (
        <main className="piggybank">
            <div className={`connection-banner ${isConnected ? 'connected' : ''}`}>
                {isConnected ? `Connected: ${account}` : 'No wallet connection'}
            </div>
            <br />
            {owner === undefined ? (
                <div>Loading piggy bank...</div>
            ) : (
                <>
                    <h1 className="stored">{Number(amount) / 1000000} CCD</h1>
                    <div>
                        Owned by
                        <br />
                        {owner}
                    </div>
                    <br />
                    <div>State: {smashed ? 'Smashed' : 'Intact'}</div>
                    <button type="button" onClick={() => updateState(setSmashed, setAmount)}>
                        ↻
                    </button>
                </>
            )}
            <br />
            <label>
                <div className="container">
                    <input className="input" type="number" placeholder="Deposit amount" ref={input} />
                    <button
                        className="deposit"
                        type="button"
                        onClick={() => deposit(input.current?.valueAsNumber)}
                        disabled={!canUse}
                    >
                        <PiggyIcon height="20" />
                    </button>
                </div>
            </label>
            <br />
            <br />
            <button
                className="smash"
                type="button"
                onClick={() => smash()}
                disabled={account === undefined || account !== owner || !canUse} // The smash button is only active for the contract owner.
            >
                <HammerIcon width="40" />
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
        detectConcordiumProvider()
            .then((provider) => {
                provider
                    .connect()
                    .then((acc) => {
                        // Connection accepted, set the application state parameters.
                        setAccount(acc);
                        setIsConnected(true);

                        // Listen for relevant events from the wallet.
                        provider.addChangeAccountListener(setAccount);
                    })
                    .catch(() => setIsConnected(false));
            })
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
