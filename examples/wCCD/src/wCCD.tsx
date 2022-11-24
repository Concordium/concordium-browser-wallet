/* eslint-disable no-console */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { toBuffer, AccountAddress } from '@concordium/web-sdk';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import * as leb from '@thi.ng/leb128';
import { wrap, unwrap } from './utils';
import {
    WCCD_PROXY_INDEX,
    WCCD_IMPLEMENTATION_INDEX,
    WCCD_STATE_INDEX,
    CONTRACT_SUB_INDEX,
    CONTRACT_NAME_PROXY,
    CONTRACT_NAME_IMPLEMENTATION,
    CONTRACT_NAME_STATE,
    TESTNET,
} from './constants';

import ArrowIcon from './assets/Arrow.svg';
import RefreshIcon from './assets/Refresh.svg';
import { WalletConnection, WalletConnector, withJsonRpcClient } from './wallet/WalletConnection';
import { BrowserWalletConnector } from './wallet/BrowserWallet';

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

async function updateStateWCCDBalanceAccount(account: string, setAmountAccount: (x: bigint) => void) {
    const accountAddressBytes = new AccountAddress(account).decodedAddress;

    let hexString = '';
    accountAddressBytes.forEach((byte) => {
        hexString += `0${(byte & 0xff).toString(16)}`.slice(-2); // eslint-disable-line no-bitwise
    });

    // Adding '00' because enum 0 (an `Account`) was selected instead of enum 1 (a `ContractAddress`).
    const inputParams = toBuffer(`00${hexString}`, 'hex');
    const provider = await detectConcordiumProvider();
    const res = await provider.getJsonRpcClient().invokeContract({
        method: `${CONTRACT_NAME_STATE}.getBalance`,
        contract: { index: WCCD_STATE_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: inputParams,
    });
    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(`Expected successful invocation`);
    }

    setAmountAccount(BigInt(leb.decodeULEB128(toBuffer(res.returnValue, 'hex'))[0]));
}

export default function wCCD() {
    const [connector, setConnector] = useState<WalletConnector>();
    useEffect(() => {
        BrowserWalletConnector.create().then(setConnector).catch(console.error);
    }, []);

    const [walletConnection, setWalletConnection] = useState<WalletConnection>();
    const [waitForUser, setWaitForUser] = useState<boolean>(false);
    const [connectedAccount, setConnectedAccount] = useState<string>();
    const network = TESTNET;
    const handleOnClick = useCallback(() => {
        if (connector) {
            setWaitForUser(true);
            connector
                .connect({
                    onAccountChanged(address: string | undefined) {
                        setConnectedAccount(address);
                    },
                    onChainChanged(genesisHash: string) {
                        // Check if the user is connected to testnet by checking if the genesis hash matches the expected one.
                        // Emit a warning and disconnect if it's the wrong chain.
                        if (genesisHash !== network.genesisHash) {
                            // eslint-disable-next-line no-alert
                            window.alert(
                                `Unexpected genesis hash ${genesisHash}. Expected ${network.genesisHash} (network "${network.name}").`
                            );
                            this.onDisconnect();
                        }
                    },
                    onDisconnect() {
                        walletConnection?.disconnect().catch(console.error);
                        setWalletConnection(undefined);
                        setConnectedAccount(undefined);
                    },
                })
                .then(setWalletConnection)
                .finally(() => setWaitForUser(false));
        }
    }, [connector]);

    const [ownerProxy, setOwnerProxy] = useState<string>();
    const [ownerImplementation, setOwnerImplementation] = useState<string>();
    useEffect(() => {
        if (connectedAccount && connector) {
            withJsonRpcClient(connector, async (rpcClient) => {
                // Get wCCD proxy contract owner.
                const proxyInfo = await rpcClient.getInstanceInfo({
                    index: WCCD_PROXY_INDEX,
                    subindex: CONTRACT_SUB_INDEX,
                });

                if (proxyInfo?.name !== `init_${CONTRACT_NAME_PROXY}`) {
                    // Check that we have the expected instance.
                    throw new Error(`Expected instance of proxy: ${proxyInfo?.name}`);
                }

                setOwnerProxy(proxyInfo.owner.address);

                // Get wCCD implementation contract owner.
                const implInfo = await rpcClient.getInstanceInfo({
                    index: WCCD_IMPLEMENTATION_INDEX,
                    subindex: CONTRACT_SUB_INDEX,
                });
                if (implInfo?.name !== `init_${CONTRACT_NAME_IMPLEMENTATION}`) {
                    // Check that we have the expected instance.
                    throw new Error(`Expected instance of implementation: ${implInfo?.name}`);
                }

                setOwnerImplementation(implInfo.owner.address);
            }).catch(console.error);
        }
    }, [connector, !!connectedAccount]);

    const [isWrapping, setIsWrapping] = useState<boolean>(true);
    const [hash, setHash] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [flipped, setFlipped] = useState<boolean>(false);
    const [amountAccount, setAmountAccount] = useState<bigint>(0n);
    const inputValue = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (walletConnection && connectedAccount) {
            updateStateWCCDBalanceAccount(connectedAccount, setAmountAccount).catch(console.error);
        }
    }, [walletConnection]);

    return (
        <>
            <h1 className="header">CCD &lt;-&gt; WCCD Smart Contract</h1>
            <h3>Wrap and unwrap your CCDs and wCCDs on the Concordium Testnet</h3>
            <div style={blackCardStyle}>
                <div>
                    {!walletConnection && waitForUser && (
                        <button style={ButtonStyleDisabled} type="button" disabled>
                            Waiting for user
                        </button>
                    )}
                    {!walletConnection && !waitForUser && (
                        <button style={ButtonStyle} type="button" onClick={handleOnClick}>
                            Connect Wallet
                        </button>
                    )}
                    {walletConnection && (
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
                                {connectedAccount}{' '}
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
                            setFlipped(!flipped);
                            if (walletConnection && connectedAccount) {
                                updateStateWCCDBalanceAccount(connectedAccount, setAmountAccount).catch(console.error);
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
                        placeholder="0.00"
                        ref={inputValue}
                    />
                    {waitForUser || !walletConnection ? (
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
                                const amount = input * 1000000;

                                if (!Number.isInteger(amount)) {
                                    window.alert(
                                        'Input a number into the CCD/wCCD amount field with max 6 decimal places.'
                                    ); /* eslint-disable no-alert */
                                }

                                if (connectedAccount) {
                                    setHash('');
                                    setError('');
                                    setWaitForUser(true);
                                    if (isWrapping) {
                                        wrap(
                                            connectedAccount,
                                            WCCD_PROXY_INDEX,
                                            setHash,
                                            setError,
                                            setWaitForUser,
                                            CONTRACT_SUB_INDEX,
                                            amount
                                        );
                                    } else {
                                        unwrap(
                                            connectedAccount,
                                            WCCD_PROXY_INDEX,
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
                    Proxy wCCD owned by
                    <br />
                    {ownerProxy === undefined ? (
                        <div className="loadingText">Loading...</div>
                    ) : (
                        <button
                            className="link"
                            type="button"
                            onClick={() => {
                                window.open(
                                    `https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${ownerProxy}`,
                                    '_blank',
                                    'noopener,noreferrer'
                                );
                            }}
                        >
                            {' '}
                            {ownerProxy}{' '}
                        </button>
                    )}
                </div>
                <div>
                    Implementation wCCD owned by
                    <br />
                    {ownerImplementation === undefined ? (
                        <div className="loadingText">Loading...</div>
                    ) : (
                        <button
                            className="link"
                            type="button"
                            onClick={() => {
                                window.open(
                                    `https://testnet.ccdscan.io/?dcount=1&dentity=account&daddress=${ownerImplementation}`,
                                    '_blank',
                                    'noopener,noreferrer'
                                );
                            }}
                        >
                            {' '}
                            {ownerImplementation}{' '}
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
