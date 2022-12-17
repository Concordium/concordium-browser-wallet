/* eslint-disable no-console */
/* eslint-disable no-alert */

import React, { useEffect, useState, useRef } from 'react';
import {
    toBuffer,
    deserializeReceiveReturnValue,
    serializeUpdateContractParameters,
    JsonRpcClient,
} from '@concordium/web-sdk';
import * as leb from '@thi.ng/leb128';
import { multiply, round } from 'mathjs';

import { wrap, unwrap } from './utils';
import {
    WCCD_CONTRACT_INDEX,
    CONTRACT_SUB_INDEX,
    CONTRACT_NAME,
    VIEW_FUNCTION_RAW_SCHEMA,
    BALANCEOF_FUNCTION_RAW_SCHEMA,
} from './constants';

import ArrowIcon from './assets/Arrow.svg';
import RefreshIcon from './assets/Refresh.svg';
import { withJsonRpcClient } from './wallet/WalletConnection';
import { WalletConnectionProps } from './wallet/WithWalletConnection';
import { WalletConnectionTypeButton } from './WalletConnectorTypeButton';

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
    border: '1px solid #4B4A4A',
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

async function viewAdmin(rpcClient: JsonRpcClient) {
    const res = await rpcClient.invokeContract({
        method: `${CONTRACT_NAME}.view`,
        contract: { index: WCCD_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: toBuffer(''),
    });
    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(
            `RPC call 'invokeContract' on method '${CONTRACT_NAME}.view' of contract '${WCCD_CONTRACT_INDEX}' failed`
        );
    }
    const returnValues = deserializeReceiveReturnValue(
        toBuffer(res.returnValue, 'hex'),
        toBuffer(VIEW_FUNCTION_RAW_SCHEMA, 'base64'),
        CONTRACT_NAME,
        'view',
        2
    );
    return returnValues.admin.Account[0];
}

async function updateWCCDBalanceAccount(rpcClient: JsonRpcClient, account: string) {
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

    const res = await rpcClient.invokeContract({
        method: `${CONTRACT_NAME}.balanceOf`,
        contract: { index: WCCD_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: param,
    });
    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(
            `RPC call 'invokeContract' on method '${CONTRACT_NAME}.balanceOf' of contract '${WCCD_CONTRACT_INDEX}' failed`
        );
    }
    // The return value is an array. The value stored in the array starts at position 4 of the return value.
    return BigInt(leb.decodeULEB128(toBuffer(res.returnValue.slice(4), 'hex'))[0]);
}

export default function wCCD(props: WalletConnectionProps) {
    const {
        network,
        activeConnectorType,
        activeConnector,
        isActiveConnectorWaitingForUser,
        activeConnection,
        activeConnectionGenesisHash,
        activeConnectedAccount,
        activeConnectorError,
        connect,
    } = props;
    const [admin, setAdmin] = useState<string>();
    const [adminError, setAdminError] = useState('');

    useEffect(() => {
        // Update admin contract.
        if (activeConnection && activeConnectedAccount) {
            withJsonRpcClient(activeConnection, (rpcClient) => viewAdmin(rpcClient))
                .then((a) => {
                    setAdmin(a);
                    setAdminError('');
                })
                .catch((e) => setAdminError((e as Error).message));
        }
    }, [activeConnection, activeConnectedAccount]);

    const [isWrapping, setIsWrapping] = useState(true);
    const [hash, setHash] = useState('');
    const [transactionError, setTransactionError] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);
    const [amountAccount, setAmountAccount] = useState<bigint>();
    const [amountAccountError, setAmountAccountError] = useState('');
    const inputValue = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (activeConnection && activeConnectedAccount) {
            withJsonRpcClient(activeConnection, (rpcClient) =>
                updateWCCDBalanceAccount(rpcClient, activeConnectedAccount)
            )
                .then((a) => {
                    setAmountAccount(a);
                    setAmountAccountError('');
                })
                .catch((e) => setAmountAccountError((e as Error).message));
        } else {
            // No active connection or it doesn't have an associated account: Reset all transactions and RPC results.
            setAmountAccount(undefined);
            setAmountAccountError('');
            setAdmin(undefined);
            setAdminError('');
            setHash('');
            setTransactionError('');
        }
    }, [activeConnection, activeConnectedAccount, isFlipped]);

    const [isWaitingForUser, setWaitingForUser] = useState(false);
    return (
        <>
            <h1 className="header">CCD &lt;-&gt; WCCD Smart Contract</h1>
            <h3>Wrap and unwrap your CCDs and wCCDs on the Concordium Testnet</h3>
            <div style={blackCardStyle}>
                <div>
                    <WalletConnectionTypeButton
                        buttonStyle={ButtonStyle}
                        disabledButtonStyle={ButtonStyleDisabled}
                        connectorType="BrowserWallet"
                        connectorName="Browser Wallet"
                        setWaitingForUser={setWaitingForUser}
                        {...props}
                    />
                    <WalletConnectionTypeButton
                        buttonStyle={ButtonStyle}
                        disabledButtonStyle={ButtonStyleDisabled}
                        connectorType="WalletConnect"
                        connectorName="Wallet Connect"
                        setWaitingForUser={setWaitingForUser}
                        {...props}
                    />
                </div>
                <div>
                    {!activeConnection && isWaitingForUser && (
                        <p>
                            <button style={ButtonStyleDisabled} type="button" disabled>
                                Waiting for user
                            </button>
                        </p>
                    )}
                    {activeConnectorError && <p style={{ color: 'red' }}>Connector Error: {activeConnectorError}.</p>}
                    {!activeConnectorError && !isWaitingForUser && activeConnectorType && !activeConnector && (
                        <p>
                            <i>Loading connector...</i>
                        </p>
                    )}
                    {!activeConnection && !isWaitingForUser && activeConnectorType && activeConnector && (
                        <p>
                            <button style={ButtonStyle} type="button" onClick={connect}>
                                {isActiveConnectorWaitingForUser && 'Connecting...'}
                                {!isActiveConnectorWaitingForUser &&
                                    activeConnectorType === 'BrowserWallet' &&
                                    'Connect Browser Wallet'}
                                {!isActiveConnectorWaitingForUser &&
                                    activeConnectorType === 'WalletConnect' &&
                                    'Connect Mobile Wallet'}
                            </button>
                        </p>
                    )}
                    {/* {connectionError && <p style={{ color: 'red' }}>Connection Error: {connectionError}.</p>} */}
                    {activeConnectedAccount && (
                        <>
                            <div className="text">Connected to</div>
                            <button
                                className="link"
                                type="button"
                                onClick={() => {
                                    window.open(
                                        `https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${activeConnectedAccount}`,
                                        '_blank',
                                        'noopener,noreferrer'
                                    );
                                }}
                            >
                                {activeConnectedAccount}
                            </button>
                            <div className="text">wCCD Balance of connected account</div>
                            <div className="containerSpaceBetween">
                                {amountAccountError && <div style={{ color: 'red' }}>{amountAccountError}.</div>}
                                <div className="largeText">
                                    {!amountAccountError && amountAccount === undefined && <i>N/A</i>}
                                    {!amountAccountError &&
                                        amountAccount !== undefined &&
                                        Number(amountAccount) / 1000000}
                                </div>
                                <button
                                    className="buttonInvisible"
                                    type="button"
                                    onClick={() => setIsFlipped(!isFlipped)}
                                >
                                    {isFlipped ? (
                                        <RefreshIcon
                                            style={{ transform: 'rotate(90deg)' }}
                                            height="20px"
                                            width="20px"
                                        />
                                    ) : (
                                        <RefreshIcon height="20px" width="20px" />
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                    {activeConnectionGenesisHash && activeConnectionGenesisHash !== network.genesisHash && (
                        <p style={{ color: 'red' }}>
                            Unexpected genesis hash: Please ensure that your wallet is connected to network{' '}
                            <code>{network.name}</code>.
                        </p>
                    )}
                </div>
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
                    {isWaitingForUser || !activeConnection ? (
                        <button style={ButtonStyleDisabled} type="button" disabled>
                            Waiting for user
                        </button>
                    ) : (
                        <button
                            style={activeConnectedAccount === undefined ? ButtonStyleDisabled : ButtonStyle}
                            type="button"
                            disabled={activeConnectedAccount === undefined}
                            onClick={() => {
                                if (
                                    inputValue.current === undefined ||
                                    inputValue.current?.valueAsNumber === undefined
                                ) {
                                    window.alert(
                                        'Input a number into the CCD/wCCD amount field with max 6 decimal places.'
                                    );
                                    return;
                                }

                                const input = inputValue.current?.valueAsNumber;
                                // Amount needs to be in WEI
                                const amount = round(multiply(input, 1000000));

                                if (activeConnection && activeConnectedAccount) {
                                    setHash('');
                                    setTransactionError('');
                                    setWaitingForUser(true);
                                    const tx = (isWrapping ? wrap : unwrap)(
                                        activeConnection,
                                        activeConnectedAccount,
                                        WCCD_CONTRACT_INDEX,
                                        CONTRACT_SUB_INDEX,
                                        amount
                                    );
                                    tx.then(setHash)
                                        .catch((err) => setTransactionError((err as Error).message))
                                        .finally(() => setWaitingForUser(false));
                                }
                            }}
                        >
                            {isWrapping ? 'Wrap' : 'Unwrap'}
                        </button>
                    )}
                </label>
                {activeConnection && (
                    <>
                        <p>
                            <div>Transaction status{hash === '' ? '' : ' (May take a moment to finalize)'}</div>
                            {!hash && transactionError && <div style={{ color: 'red' }}>{transactionError}.</div>}
                            {!hash && !transactionError && (
                                <div className="loadingText">Waiting for transaction...</div>
                            )}
                            {hash && (
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
                                        {hash}
                                    </button>
                                    <br />
                                </>
                            )}
                        </p>
                        <p>
                            The admin of the wCCD smart contract instance is
                            <br />
                            {adminError && <div style={{ color: 'red' }}>{adminError}.</div>}
                            {!adminError && admin === undefined && <div className="loadingText">Loading...</div>}
                            {!adminError && admin !== undefined && (
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
                                    {admin}
                                </button>
                            )}
                        </p>
                    </>
                )}
            </div>
        </>
    );
}
