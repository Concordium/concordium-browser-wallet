/* eslint-disable no-console */
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { toBuffer, AccountAddress } from '@concordium/web-sdk';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import * as leb from '@thi.ng/leb128';
import { wrap, unwrap, state, CONTRACT_NAME_PROXY, CONTRACT_NAME_IMPLEMENTATION, CONTRACT_NAME_STATE } from './utils';

import ArrowIcon from './assets/Arrow.svg';

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

const blackCardStyle = {
    backgroundColor: 'black',
    color: 'white',
    width: '484px',
    borderRadius: 20,
    margin: '20px 0px 20px 0px',
    padding: '29px 18px',
    border: '1px solid #308274',
};

const ButtonStyle = {
    color: 'white',
    borderRadius: 20,
    margin: '20px 0px 20px 0px',
    padding: '10px',
    width: '100%',
    border: '1px solid #26685D',
    backgroundColor: '#308274',
    cursor: 'pointer',
};

const InputFieldStyle = {
    backgroundColor: '#181817',
    color: 'white',
    borderRadius: 20,
    width: '100%',
    border: '1px solid #308274',
    margin: '20px 0px 20px 0px',
    padding: '10px 20px',
};

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
    const [isWrapping, setIsWrapping] = useState<boolean>(true);
    const [hash, setHash] = useState<string>();
    const [amountAccount, setAmountAccount] = useState<bigint>(0n);
    const inputValue = useRef<HTMLInputElement>(null);

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

        if (isConnected) {
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

    useEffect(() => {
        if (account) {
            updateStateWCCDBalanceAccount(account, setAmountAccount);
        }
    }, [account]);

    return (
        <>
            <h1 className="stored">CCD &lt;-&gt; WCCD Smart Contract</h1>
            <h2 className="stored">Wrap and unwrap your CCDs and wCCDs on the Concordium Testnet</h2>
            <div style={blackCardStyle}>
                <div>
                    {isConnected && (
                        <>
                            <div>Connected to</div>
                            <button
                                className="link"
                                type="button"
                                onClick={() => {
                                    window.open(
                                        `https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${account}`,
                                        '_blank',
                                        'noopener,noreferrer'
                                    );
                                }}
                            >
                                {' '}
                                {account}{' '}
                            </button>
                        </>
                    )}
                    {!isConnected && (
                        <button style={ButtonStyle} type="button" onClick={handleOnClick}>
                            Connect Wallet
                        </button>
                    )}
                </div>
                {ownerProxy === undefined ? (
                    <div>Loading wCCD contract...</div>
                ) : (
                    <>
                        <div>wCCD Balance of connected account</div>
                        <h1 className="stored">{Number(amountAccount) / 1000000} WCCD</h1>
                    </>
                )}
                <div className="container">
                    <div>CCD</div>
                    <button className="switch" type="button" onClick={() => setIsWrapping(!isWrapping)}>
                        {isWrapping ? (
                            <ArrowIcon height="25" />
                        ) : (
                            <ArrowIcon style={{ transform: 'scaleX(-1)' }} height="25" />
                        )}
                    </button>
                    <div>WCCD</div>
                </div>
                <label>
                    <input
                        className="input"
                        style={InputFieldStyle}
                        type="number"
                        placeholder="0.00"
                        ref={inputValue}
                    />
                    <button
                        style={ButtonStyle}
                        type="button"
                        disabled={account === undefined}
                        onClick={() => {
                            if (account) {
                                if (isWrapping) {
                                    wrap(
                                        account,
                                        WCCD_PROXY_INDEX,
                                        setHash,
                                        CONTRACT_SUB_INDEX,
                                        inputValue.current?.valueAsNumber
                                    );
                                } else {
                                    unwrap(
                                        account,
                                        WCCD_PROXY_INDEX,
                                        setHash,
                                        CONTRACT_SUB_INDEX,
                                        inputValue.current?.valueAsNumber
                                    );
                                }
                            }
                        }}
                    >
                        {isWrapping ? 'Wrap' : 'Unwrap'}
                    </button>
                </label>
                <div>Transaction status (May take a moment to finalize)</div>
                <button
                    className="link"
                    type="button"
                    onClick={() => {
                        window.open(
                            `https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${hash}`,
                            '_blank',
                            'noopener,noreferrer'
                        );
                    }}
                >
                    {' '}
                    {hash}{' '}
                </button>
                <br />
                <div style={{ color: 'white' }}>Refresh values</div>
                <button
                    type="button"
                    onClick={() => {
                        if (account) {
                            updateStateWCCDBalanceAccount(account, setAmountAccount);
                        }
                    }}
                >
                    ↻
                </button>
                <br />
                <br />
                <a
                    style={{ color: 'white' }}
                    href="https://developer.concordium.software/en/mainnet/smart-contracts/tutorials/wCCD/index.html"
                    target="_blank"
                    rel="noreferrer"
                >
                    You can read more about how to make a wrapper like this here.
                </a>
            </div>
        </>
    );
}
