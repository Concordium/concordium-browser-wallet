/* eslint-disable no-console */
import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { toBuffer, deserializeReceiveReturnValue, serializeUpdateContractParameters } from '@concordium/web-sdk';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import * as leb from '@thi.ng/leb128';
import { multiply, round } from 'mathjs';

import { wrap, unwrap, state } from './utils';
import {
    TESTNET_GENESIS_BLOCK_HASH,
    WCCD_CONTRACT_INDEX,
    CONTRACT_SUB_INDEX,
    CONTRACT_NAME,
    VIEW_FUNCTION_RAW_SCHEMA,
    BALANCEOF_FUNCTION_RAW_SCHEMA,
} from './constants';

import ArrowIcon from './assets/Arrow.svg';
import RefreshIcon from './assets/Refresh.svg';

const blackCardStyle = {
    backgroundColor: 'black',
    color: 'white',
    width: '484px',
    borderRadius: 10,
    margin: '10px 0px 10px 0px',
    padding: '10px 18px',
    border: '1px solid #308274',
};

const ButtonStyle = {
    color: 'white',
    borderRadius: 10,
    margin: '7px 0px 7px 0px',
    padding: '10px',
    width: '100%',
    border: '1px solid #26685D',
    backgroundColor: '#308274',
    cursor: 'pointer',
    fontWeight: 300,
    fontSize: '14px',
};

const ButtonStyleDisabled = {
    color: 'white',
    borderRadius: 10,
    margin: '7px 0px 7px 0px',
    padding: '10px',
    width: '100%',
    border: '1px solid #308274',
    backgroundColor: '#979797',
    cursor: 'pointer',
    fontWeight: 300,
    fontSize: '14px',
};

const InputFieldStyle = {
    backgroundColor: '#181817',
    color: 'white',
    borderRadius: 10,
    width: '100%',
    border: '1px solid #308274',
    margin: '7px 0px 7px 0px',
    padding: '10px 20px',
};

async function viewAdmin(setAdmin: (x: string) => void) {
    const provider = await detectConcordiumProvider();
    const res = await provider.getJsonRpcClient().invokeContract({
        method: `${CONTRACT_NAME}.view`,
        contract: { index: WCCD_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: toBuffer(''),
    });
    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(`Expected succesful invocation`);
    }

    const returnValues = deserializeReceiveReturnValue(
        toBuffer(res.returnValue, 'hex'),
        toBuffer(VIEW_FUNCTION_RAW_SCHEMA, 'base64'),
        CONTRACT_NAME,
        'view',
        2
    );

    setAdmin(returnValues.admin.Account[0]);
}

async function updateWCCDBalanceAccount(account: string, setAmountAccount: (x: bigint) => void) {
    const param = serializeUpdateContractParameters(
        CONTRACT_NAME,
        'balanceOf',
        [
            {
                address: {
                    Account: [account],
                },
                token_id: '',
            },
        ],
        toBuffer(BALANCEOF_FUNCTION_RAW_SCHEMA, 'base64')
    );

    const provider = await detectConcordiumProvider();
    const res = await provider.getJsonRpcClient().invokeContract({
        method: `${CONTRACT_NAME}.balanceOf`,
        contract: { index: WCCD_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: param,
    });
    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(`Expected succesful invocation`);
    }

    // The return value is an array. The value stored in the array starts at position 4 of the return value.
    setAmountAccount(BigInt(leb.decodeULEB128(toBuffer(res.returnValue.slice(4), 'hex'))[0]));
}

interface Props {
    handleGetAccount: (accountAddress: string | undefined) => void;
    handleNotConnected: () => void;
}

export default function wCCD({ handleGetAccount, handleNotConnected }: Props) {
    const { account, isConnected } = useContext(state);
    const [admin, setAdmin] = useState<string>();
    const [isWrapping, setIsWrapping] = useState<boolean>(true);
    const [hash, setHash] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [flipped, setflipped] = useState<boolean>(false);
    const [waitForUser, setWaitForUser] = useState<boolean>(false);
    const [amountAccount, setAmountAccount] = useState<bigint>(0n);
    const inputValue = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isConnected) {
            viewAdmin(setAdmin);
        }

        if (isConnected) {
            if (account) {
                updateWCCDBalanceAccount(account, setAmountAccount);
            }
        }
    }, [isConnected]);

    const handleOnClick = useCallback(() => {
        setWaitForUser(true);

        detectConcordiumProvider()
            .then((provider) => provider.connect())
            .then(handleGetAccount)
            .then(() => {
                setWaitForUser(false);
                detectConcordiumProvider()
                    // Check if the user is connected to testnet by checking if the testnet genesisBlock exists.
                    // Throw a warning and disconnect if not. We only want to
                    // allow users to interact with our testnet smart contracts.
                    .then((provider) =>
                        provider
                            .getJsonRpcClient()
                            .getCryptographicParameters(TESTNET_GENESIS_BLOCK_HASH.toString())
                            .then((result) => {
                                if (result === undefined || result?.value === null) {
                                    handleNotConnected();
                                    /* eslint-disable no-alert */
                                    window.alert(
                                        'Your JsonRpcClient in the Concordium browser wallet cannot connect. Check if your Concordium browser wallet is connected to testnet!'
                                    );
                                }
                            })
                    );
            })
            .catch(() => {
                window.alert(
                    'Your JsonRpcClient in the Concordium browser wallet cannot connect. Check if your Concordium browser wallet is connected to testnet!'
                );
                setWaitForUser(false);
            });
    }, []);

    useEffect(() => {
        if (account) {
            updateWCCDBalanceAccount(account, setAmountAccount);
        }
    }, [account]);

    return (
        <>
            <h1 className="header">CCD &lt;-&gt; WCCD Smart Contract</h1>
            <h3>Wrap and unwrap your CCDs and wCCDs on the Concordium Testnet</h3>
            <div style={blackCardStyle}>
                <div>
                    {!isConnected && waitForUser && (
                        <button style={ButtonStyleDisabled} type="button" disabled>
                            Waiting for user
                        </button>
                    )}
                    {!isConnected && !waitForUser && (
                        <button style={ButtonStyle} type="button" onClick={handleOnClick}>
                            Connect Wallet
                        </button>
                    )}
                    {isConnected && (
                        <>
                            <div className="text">Connected to</div>
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
                                {account}{' '}
                            </button>
                        </>
                    )}
                </div>
                <br />
                <div className="text">wCCD Balance of connected account</div>
                <div className="containerSpaceBetween">
                    <div className="largeText">{Number(amountAccount) / 1000000}</div>
                    <button
                        className="buttonInvisible"
                        type="button"
                        onClick={() => {
                            setflipped(!flipped);
                            if (account) {
                                updateWCCDBalanceAccount(account, setAmountAccount);
                            }
                        }}
                    >
                        {flipped ? (
                            <RefreshIcon style={{ transform: 'rotate(90deg)' }} height="20px" width="20px" />
                        ) : (
                            <RefreshIcon height="20px" width="20px" />
                        )}
                    </button>
                </div>
                <br />
                <div className="containerSwitch">
                    <div className="largeText">CCD &nbsp; &nbsp; </div>
                    <button className="switch" type="button" onClick={() => setIsWrapping(!isWrapping)}>
                        {isWrapping ? (
                            <ArrowIcon
                                style={{ padding: '2px 2px 0px 0px', borderRadius: '5' }}
                                height="20px"
                                width="20px"
                            />
                        ) : (
                            <ArrowIcon
                                style={{ padding: '2px 2px 0px 0px', borderRadius: '5', transform: 'scaleX(-1)' }}
                                height="20px"
                                width="20px"
                            />
                        )}
                    </button>
                    <div className="largeText">&nbsp; &nbsp; wCCD</div>
                </div>
                <label>
                    <input
                        className="input"
                        style={InputFieldStyle}
                        type="number"
                        placeholder="0.000000"
                        ref={inputValue}
                    />
                    {waitForUser || !isConnected ? (
                        <button style={ButtonStyleDisabled} type="button" disabled>
                            Waiting for user
                        </button>
                    ) : (
                        <button
                            style={ButtonStyle}
                            type="button"
                            disabled={account === undefined}
                            onClick={() => {
                                if (
                                    inputValue.current === undefined ||
                                    inputValue.current?.valueAsNumber === undefined
                                ) {
                                    /* eslint-disable no-alert */
                                    window.alert(
                                        'Input a number into the CCD/wCCD amount field with max 6 decimal places.'
                                    );
                                    return;
                                }

                                const input = inputValue.current?.valueAsNumber;
                                // Amount needs to be in WEI
                                const amount = round(multiply(input, 1000000));

                                if (account) {
                                    setHash('');
                                    setError('');
                                    setWaitForUser(true);
                                    if (isWrapping) {
                                        wrap(
                                            account,
                                            WCCD_CONTRACT_INDEX,
                                            setHash,
                                            setError,
                                            setWaitForUser,
                                            CONTRACT_SUB_INDEX,
                                            amount
                                        );
                                    } else {
                                        unwrap(
                                            account,
                                            WCCD_CONTRACT_INDEX,
                                            setHash,
                                            setError,
                                            setWaitForUser,
                                            CONTRACT_SUB_INDEX,
                                            amount
                                        );
                                    }
                                }
                            }}
                        >
                            {isWrapping ? 'Wrap' : 'Unwrap'}
                        </button>
                    )}
                </label>
                <br />
                <br />
                <div>Transaction status{hash === '' ? '' : ' (May take a moment to finalize)'}</div>
                {hash === '' && error !== '' && <div style={{ color: 'red' }}>Transaction rejected by wallet.</div>}
                {hash === '' && error === '' && <div className="loadingText">Waiting for transaction...</div>}
                {hash !== '' && (
                    <>
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
                    </>
                )}
                <br />
                <div>
                    The admin of the wCCD smart contract instance is
                    <br />
                    {admin === undefined ? (
                        <div className="loadingText">Loading...</div>
                    ) : (
                        <button
                            className="link"
                            type="button"
                            onClick={() => {
                                window.open(
                                    `https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${admin}`,
                                    '_blank',
                                    'noopener,noreferrer'
                                );
                            }}
                        >
                            {' '}
                            {admin}{' '}
                        </button>
                    )}
                </div>
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
