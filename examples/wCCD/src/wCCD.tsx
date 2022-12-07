/* eslint-disable no-console */

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
    TESTNET,
    WALLET_CONNECT_PROJECT_ID,
} from './constants';

import ArrowIcon from './assets/Arrow.svg';
import RefreshIcon from './assets/Refresh.svg';
import {
    ConnectionDelegate,
    destroy,
    WalletConnection,
    WalletConnector,
    withJsonRpcClient,
} from './wallet/WalletConnection';
import { BrowserWalletConnector } from './wallet/BrowserWallet';
import { WalletConnectConnector } from './wallet/WalletConnect';

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

function connectorTypeStyle(selected: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const style = { ...ButtonStyle, width: '50%' } as any;
    if (selected) {
        style.backgroundColor = '#174039';
        style.border = '1px solid #0c221f';
    }
    return style;
}

async function viewAdmin(rpcClient: JsonRpcClient, setAdmin: (x: string) => void) {
    const res = await rpcClient.invokeContract({
        method: `${CONTRACT_NAME}.view`,
        contract: { index: WCCD_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: toBuffer(''),
    });
    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(`Expected successful invocation`);
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

async function updateWCCDBalanceAccount(
    rpcClient: JsonRpcClient,
    account: string,
    setAmountAccount: (x: bigint) => void
) {
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
        throw new Error(`Expected successful invocation`);
    }

    // The return value is an array. The value stored in the array starts at position 4 of the return value.
    setAmountAccount(BigInt(leb.decodeULEB128(toBuffer(res.returnValue.slice(4), 'hex'))[0]));
}

const network = TESTNET;

type ConnectorType = 'BrowserWallet' | 'WalletConnect';

export default function wCCD() {
    const [connectorType, setConnectorType] = useState<ConnectorType>();
    const [connector, setConnector] = useState<WalletConnector>();
    const [walletConnection, setWalletConnection] = useState<WalletConnection>();

    // TODO Captured walletConnection becomes stale within the closures (staying 'undefined')! Must change to class component (and let the class implement delegate)?
    const [connectedAccount, setConnectedAccount] = useState<string>();
    const delegate = useMemo<ConnectionDelegate>(
        () => ({
            onAccountChanged(connection: WalletConnection, address: string | undefined) {
                console.log('account changed', { connection, address, walletConnection });
                if (connection === walletConnection) {
                    console.log('setting account');
                    setConnectedAccount(address);
                }
            },
            onChainChanged(connection: WalletConnection, genesisHash: string) {
                // Check if the user is connected to testnet by checking if the genesis hash matches the expected one.
                // Emit a warning and disconnect if it's the wrong chain.
                if (genesisHash !== network.genesisHash) {
                    // eslint-disable-next-line no-alert
                    window.alert(
                        `Unexpected genesis hash '${genesisHash}'. Expected ${network.genesisHash} (network "${network.name}").`
                    );
                    connection.disconnect().catch(console.error);
                }
            },
            onDisconnect(connection: WalletConnection) {
                if (connection === walletConnection) {
                    console.log('clearing wallet connection');
                    setWalletConnection(undefined); // triggers clearing of connected account
                }
            },
        }),
        []
    );
    useEffect(() => {
        if (connectorType) {
            switch (connectorType) {
                case 'BrowserWallet':
                    BrowserWalletConnector.create(delegate).then(setConnector).catch(console.error);
                    break;
                case 'WalletConnect':
                    WalletConnectConnector.create(
                        {
                            projectId: WALLET_CONNECT_PROJECT_ID,
                            metadata: {
                                name: 'wCCD',
                                description: 'Example dApp for the wCCD token.',
                                url: '#',
                                icons: ['https://walletconnect.com/walletconnect-logo.png'],
                            },
                        },
                        network,
                        delegate
                    )
                        .then(setConnector)
                        .catch(console.error);
                    break;
                default:
                    throw new Error(`invalid connector type '${connectorType}'`);
            }
        }
        return () => {
            if (connector) destroy(connector).catch(console.error);
        };
    }, [connectorType]);

    const [waitingForUser, setWaitingForUser] = useState<boolean>(false);
    const connectWallet = useCallback(() => {
        if (connector) {
            setWaitingForUser(true);
            connector
                .connect(delegate)
                .then((c) => {
                    console.log('setting wallet connection', c);
                    setWalletConnection(c);
                    return c.getConnectedAccount();
                })
                .then(setConnectedAccount)
                .catch(console.error)
                .finally(() => setWaitingForUser(false));
        }
    }, [connector]);

    const [admin, setAdmin] = useState<string>();

    useEffect(() => {
        // // Clear 'connectedAccount' when 'walletConnection' is.
        // if (!walletConnection) {
        //     setConnectedAccount(undefined);
        // }
        // Update admin contract.
        if (walletConnection) {
            withJsonRpcClient(walletConnection, (rpcClient) => viewAdmin(rpcClient, setAdmin)).catch(console.error);
        }

        return () => setConnectedAccount(undefined);
    }, [walletConnection]);

    const [isWrapping, setIsWrapping] = useState<boolean>(true);
    const [hash, setHash] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [amountAccount, setAmountAccount] = useState<bigint>();
    const inputValue = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (walletConnection && connectedAccount) {
            withJsonRpcClient(walletConnection, (rpcClient) =>
                updateWCCDBalanceAccount(rpcClient, connectedAccount, setAmountAccount)
            ).catch(console.error);
        } else {
            setAmountAccount(undefined);
        }
    }, [walletConnection, connectedAccount, isFlipped]);

    return (
        <>
            <h1 className="header">CCD &lt;-&gt; WCCD Smart Contract</h1>
            <h3>Wrap and unwrap your CCDs and wCCDs on the Concordium Testnet</h3>
            <div style={blackCardStyle}>
                <div>
                    <button
                        style={connectorTypeStyle(connectorType === 'BrowserWallet')}
                        type="button"
                        onClick={() => setConnectorType('BrowserWallet')}
                    >
                        Use Browser Wallet
                    </button>
                    <button
                        style={connectorTypeStyle(connectorType === 'WalletConnect')}
                        type="button"
                        onClick={() => setConnectorType('WalletConnect')}
                    >
                        Use Wallet Connect
                    </button>
                </div>
                <div>
                    {!walletConnection && waitingForUser && (
                        <button style={ButtonStyleDisabled} type="button" disabled>
                            Waiting for user
                        </button>
                    )}
                    {!walletConnection && !waitingForUser && connectorType && (
                        <button style={ButtonStyle} type="button" onClick={connectWallet}>
                            {connectorType === 'BrowserWallet' && 'Connect Browser Wallet'}
                            {connectorType === 'WalletConnect' && 'Connect Mobile Wallet'}
                        </button>
                    )}
                    {connectedAccount && (
                        <>
                            <div className="text">Connected to</div>
                            <button
                                className="link"
                                type="button"
                                onClick={() => {
                                    window.open(
                                        `https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${connectedAccount}`,
                                        '_blank',
                                        'noopener,noreferrer'
                                    );
                                }}
                            >
                                {connectedAccount}
                            </button>
                            <div className="text">wCCD Balance of connected account</div>
                            <div className="containerSpaceBetween">
                                <div className="largeText">
                                    {amountAccount === undefined ? <i>N/A</i> : Number(amountAccount) / 1000000}
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
                    {!connectedAccount && (
                        <div className="text">
                            <i>Please connect a wallet.</i>
                        </div>
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
                    {waitingForUser || !walletConnection ? (
                        <button style={ButtonStyleDisabled} type="button" disabled>
                            Waiting for user
                        </button>
                    ) : (
                        <button
                            style={ButtonStyle}
                            type="button"
                            disabled={connectedAccount === undefined}
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

                                if (walletConnection && connectedAccount) {
                                    setHash('');
                                    setError('');
                                    setWaitingForUser(true);
                                    const tx = (isWrapping ? wrap : unwrap)(
                                        walletConnection,
                                        connectedAccount,
                                        WCCD_CONTRACT_INDEX,
                                        CONTRACT_SUB_INDEX,
                                        amount
                                    );
                                    tx.then(setHash)
                                        .catch((err) => setError((err as Error).message))
                                        .finally(() => setWaitingForUser(false));
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
                {hash === '' && error !== '' && <div style={{ color: 'red' }}>{error}</div>}
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
