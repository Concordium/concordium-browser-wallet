/* eslint-disable no-console */
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { toBuffer, AccountAddress } from '@concordium/web-sdk';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import * as leb from '@thi.ng/leb128';
import { wrap, unwrap, state, CONTRACT_NAME_PROXY, CONTRACT_NAME_IMPLEMENTATION, CONTRACT_NAME_STATE } from './utils';

/** If you want to test admin functions of the wCCD contract,
 * it will be necessary to instantiate your own wCCD contract using an account available in the browser wallet,
 * and change these constants to match the indexes of the instances.
 *
 * Should match the subindexes of the instances targeted.
 * V1 Module reference on testnet: 2975c0dded52f5f78118c42970785da9227e2bc8173af0b913599df8e3023818
 */
const WCCD_PROXY_INDEX = 866n;
const WCCD_IMPLEMENTATION_INDEX = 865n;
const WCCD_STATE_INDEX = 864n;

const CONTRACT_SUB_INDEX = 0n;

const mystyle = {
    backgroundColor: 'black',
    color: 'white',
    borderRadius: 20,
    margin: '20px 0px 20px 0px',
    padding: '10px',
    border: '1px solid #308274',
};

const mystyle2 = {
    backgroundColor: 'black',
    color: 'white',
    borderRadius: 20,
    margin: '20px 0px 20px 0px',
    padding: '10px',
    border: '1px solid #308274',
};

const mystyle3 = {
    backgroundColor: 'black',
    color: 'white',
    borderRadius: 20,
    margin: '20px 0px 20px 0px',
    padding: '10px',
    border: '1px solid #308274',
};

const mystyle4 = {
    backgroundColor: 'black',
    color: 'white',
    borderRadius: 20,
    margin: '20px 0px 20px 0px',
    padding: '10px',
    border: '1px solid #308274',
};

async function updateStateViewBalanceProxy(setAmountProxy: (x: bigint) => void) {
    const provider = await detectConcordiumProvider();
    const res = await provider.getJsonRpcClient().invokeContract({
        method: `${CONTRACT_NAME_PROXY}.viewBalance`,
        contract: { index: WCCD_PROXY_INDEX, subindex: CONTRACT_SUB_INDEX },
    });

    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(`Expected succesful invocation`);
    }
    setAmountProxy(toBuffer(res.returnValue, 'hex').readBigUInt64LE(0) as bigint);
}

async function updateStateWCCDBalanceAccount(account: string, setAmountAccount: (x: bigint) => void) {
    const accountAddressBytes = new AccountAddress(account).decodedAddress;

    let hexString = '';
    accountAddressBytes.forEach((byte) => {
        hexString += `0${(byte & 0xff).toString(16)}`.slice(-2); // eslint-disable-line no-bitwise
    });

    // Adding '00' because enum 0 (an `Account`) was selected instead of enum 1 (an `ContractAddress`).
    const inputParams = toBuffer(`00${hexString}`, 'hex');
    const provider = await detectConcordiumProvider();
    const res = await provider.getJsonRpcClient().invokeContract({
        method: `${CONTRACT_NAME_STATE}.getBalance`,
        contract: { index: WCCD_STATE_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: inputParams,
    });
    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(`Expected succesful invocation`);
    }

    setAmountAccount(BigInt(leb.decodeULEB128(toBuffer(res.returnValue, 'hex'))[0]));
}

interface Props {
    handleGetAccount: (accountAddress: string | undefined) => void;
}

export default function wCCD({ handleGetAccount }: Props) {
    const { account, isConnected } = useContext(state);
    const [ownerProxy, setOwnerProxy] = useState<string>();
    const [ownerImplementation, setOwnerImplementation] = useState<string>();
    const [hashWrap, setHashWrap] = useState<string>();
    const [hashTextWrap, setHashTextWrap] = useState<string>();
    const [hashUnwrap, setHashUnwrap] = useState<string>();
    const [hashTextUnwrap, setHashTextUnwrap] = useState<string>();
    const [amountProxy, setAmountProxy] = useState<bigint>(0n);
    const [amountAccount, setAmountAccount] = useState<bigint>(0n);
    const inputWrap = useRef<HTMLInputElement>(null);
    const inputUnwrap = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isConnected) {
            // Get wCCD proxy contract owner.
            detectConcordiumProvider()
                .then((provider) =>
                    provider
                        .getJsonRpcClient()
                        .getInstanceInfo({ index: WCCD_PROXY_INDEX, subindex: CONTRACT_SUB_INDEX })
                )
                .then((info) => {
                    if (info?.name !== `init_${CONTRACT_NAME_PROXY}`) {
                        // Check that we have the expected instance.
                        throw new Error(`Expected instance of proxy: ${info?.name}`);
                    }

                    setOwnerProxy(info.owner.address);
                });

            // Get wCCD implementation contract owner.
            detectConcordiumProvider()
                .then((provider) =>
                    provider
                        .getJsonRpcClient()
                        .getInstanceInfo({ index: WCCD_IMPLEMENTATION_INDEX, subindex: CONTRACT_SUB_INDEX })
                )
                .then((info) => {
                    if (info?.name !== `init_${CONTRACT_NAME_IMPLEMENTATION}`) {
                        // Check that we have the expected instance.
                        throw new Error(`Expected instance of implementation: ${info?.name}`);
                    }

                    setOwnerImplementation(info.owner.address);
                    console.log(ownerImplementation);
                });
        }
    }, [isConnected]);

    // The internal state of the wCCD smart contract.
    useEffect(() => {
        if (isConnected) {
            updateStateViewBalanceProxy(setAmountProxy);
            if (account) {
                updateStateWCCDBalanceAccount(account, setAmountAccount);
            }
        }
    }, [isConnected]);

    const handleOnClick = useCallback(
        () =>
            detectConcordiumProvider()
                .then((provider) => provider.connect())
                .then(handleGetAccount),
        []
    );

    return (
        <>
            <h1 className="stored">CCD &lt;-&gt; WCCD Smart Contract</h1>
            <h2 className="stored">Wrap and unwrap your CCDs and wCCDs on the Concordium Testnet</h2>
            <div style={mystyle}>
                <div style={mystyle2}>
                    <div>
                        {isConnected && `Connected: ${account}`}
                        {!isConnected && (
                            <>
                                <p>No wallet connection</p>
                                <button type="button" onClick={handleOnClick}>
                                    Connect
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div style={mystyle3}>
                    <div>Text</div>
                </div>
                <div style={mystyle4}>
                    <div>Text</div>
                </div>
                {ownerProxy === undefined ? (
                    <div>Loading wCCD contract...</div>
                ) : (
                    <>
                        <div>CCD Balance on wCCD Proxy:</div>
                        <h1 className="stored">{Number(amountProxy) / 1000000} CCD</h1>
                        <div>{`wCCD Balance of connected account: ${account}:`}</div>
                        <h1 className="stored">{Number(amountAccount) / 1000000} WCCD</h1>
                    </>
                )}
            </div>
            <br />
            <div>Refresh values</div>
            <button
                type="button"
                onClick={() => {
                    updateStateViewBalanceProxy(setAmountProxy);
                    if (account) {
                        updateStateWCCDBalanceAccount(account, setAmountAccount);
                    }
                }}
            >
                ↻
            </button>
            <br />
            <label>
                <div className="container">
                    <input className="input" type="number" placeholder="Wrap amount" ref={inputWrap} />
                    <button
                        className="deposit"
                        type="button"
                        onClick={() =>
                            account &&
                            wrap(
                                account,
                                WCCD_PROXY_INDEX,
                                setHashWrap,
                                setHashTextWrap,
                                CONTRACT_SUB_INDEX,
                                inputWrap.current?.valueAsNumber
                            )
                        }
                        disabled={account === undefined}
                    >
                        Click here to wrap
                    </button>
                </div>
                <button
                    className="link"
                    type="button"
                    onClick={() => {
                        window.open(
                            `https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${hashWrap}`,
                            '_blank',
                            'noopener,noreferrer'
                        );
                    }}
                >
                    {' '}
                    {hashTextWrap}{' '}
                </button>
            </label>
            <label>
                <div className="container">
                    <input className="input" type="number" placeholder="Unwrap amount" ref={inputUnwrap} />
                    <button
                        className="deposit"
                        type="button"
                        onClick={() =>
                            account &&
                            unwrap(
                                account,
                                WCCD_PROXY_INDEX,
                                setHashUnwrap,
                                setHashTextUnwrap,
                                CONTRACT_SUB_INDEX,
                                inputUnwrap.current?.valueAsNumber
                            )
                        }
                        disabled={account === undefined}
                    >
                        Click here to unwrap
                    </button>
                </div>
                <button
                    className="link"
                    type="button"
                    onClick={() => {
                        window.open(
                            `https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${hashUnwrap}`,
                            '_blank',
                            'noopener,noreferrer'
                        );
                    }}
                >
                    {' '}
                    {hashTextUnwrap}{' '}
                </button>
            </label>
            <br />
            <br />
        </>
    );
}
