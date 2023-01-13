/* eslint-disable no-console */
/* eslint-disable no-alert */

import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import Switch from 'react-switch';
import {
    toBuffer,
    deserializeReceiveReturnValue,
    serializeUpdateContractParameters,
    JsonRpcClient,
} from '@concordium/web-sdk';
import sha256 from 'sha256';
import { version } from '../package.json';

import { register } from './utils';
import {
    E_SEALING_CONTRACT_NAME,
    E_SEALING_CONTRACT_INDEX,
    E_SEALING_RAW_SCHEMA,
    CONTRACT_SUB_INDEX,
} from './constants';

import { withJsonRpcClient } from './wallet/WalletConnection';
import { WalletConnectionProps } from './wallet/WithWalletConnection';
import { WalletConnectionTypeButton } from './WalletConnectorTypeButton';

const blackCardStyle = {
    backgroundColor: 'black',
    color: 'white',
    width: '500px',
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

const ButtonStyleSelected = {
    color: 'white',
    borderRadius: 10,
    margin: '7px 0px 7px 0px',
    padding: '10px',
    width: '100%',
    border: '0px solid',
    backgroundColor: '#174039',
    cursor: 'pointer',
    fontWeight: 300,
    fontSize: '14px',
};

const ButtonStyleNotSelected = {
    color: 'white',
    borderRadius: 10,
    margin: '7px 0px 7px 0px',
    padding: '10px',
    width: '100%',
    border: '0px solid',
    backgroundColor: '#308274',
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

async function viewFile(rpcClient: JsonRpcClient, fileHashHex: string) {
    const param = serializeUpdateContractParameters(
        E_SEALING_CONTRACT_NAME,
        'getFile',
        fileHashHex,
        toBuffer(E_SEALING_RAW_SCHEMA, 'base64')
    );

    const res = await rpcClient.invokeContract({
        method: `${E_SEALING_CONTRACT_NAME}.getFile`,
        contract: { index: E_SEALING_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: param,
    });

    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(
            `RPC call 'invokeContract' on method '${E_SEALING_CONTRACT_NAME}.view' of contract '${E_SEALING_CONTRACT_INDEX}' failed`
        );
    }

    const returnValues = deserializeReceiveReturnValue(
        toBuffer(res.returnValue, 'hex'),
        toBuffer(E_SEALING_RAW_SCHEMA, 'base64'),
        E_SEALING_CONTRACT_NAME,
        'getFile',
        2
    );

    if (returnValues.Some !== undefined) {
        return returnValues.Some[0];
    }
    return { timestamp: 'Not registered', witness: 'Not registered' };
}

export default function SEALING(props: WalletConnectionProps) {
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

    const [isLoading, setLoading] = useState<boolean>(false);

    const [getFileError, setGetFileError] = useState('');
    const [fileHashHex, setFileHashHex] = useState('');

    const [selectedFile, setSelectedFile] = useState<File>();

    const [witness, setWitness] = useState('');
    const [timestamp, setTimestamp] = useState('');

    const changeHandler = (event: ChangeEvent) => {
        const test = event.target as HTMLInputElement;
        if (test.files) {
            const file = test.files[0];
            setSelectedFile(file);
        }
    };

    useEffect(() => {
        // View file record.
        if (activeConnection && activeConnectedAccount) {
            withJsonRpcClient(activeConnection, (rpcClient) => viewFile(rpcClient, fileHashHex))
                .then((record) => {
                    setGetFileError('');
                    setTimestamp(record.timestamp);
                    setWitness(record.witness);
                })
                .catch((e) => {
                    setGetFileError((e as Error).message);
                    setTimestamp('');
                    setWitness('');
                });
        }
    }, [activeConnection, activeConnectedAccount, fileHashHex]);

    const [isRegisterFilePage, setIsRegisterFilePage] = useState(true);
    const [hash, setHash] = useState('');
    const [transactionError, setTransactionError] = useState('');
    const [loadingError, setLoadingError] = useState('');

    const file = useRef<HTMLInputElement | null>(null);

    const [isWaitingForTransaction, setWaitingForUser] = useState(false);
    return (
        <div style={blackCardStyle}>
            <h1 className="header">Register a file on Concordium</h1>
            <div className="containerSpaceBetween">
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
                {activeConnectorError && <p style={{ color: 'red' }}>Connector Error: {activeConnectorError}.</p>}
                {!activeConnectorError && !isWaitingForTransaction && activeConnectorType && !activeConnector && (
                    <p>
                        <i>Loading connector...</i>
                    </p>
                )}
                {!activeConnection && !isWaitingForTransaction && activeConnectorType && activeConnector && (
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
                        <br />
                        <br />
                        <div className="containerSpaceBetween">
                            <button
                                style={!isRegisterFilePage ? ButtonStyleNotSelected : ButtonStyleSelected}
                                type="button"
                                onClick={() => {
                                    setIsRegisterFilePage(true);
                                    setFileHashHex('');
                                    setWitness('');
                                    setTimestamp('');
                                    setHash('');
                                }}
                            >
                                Registration Tab
                            </button>
                            <Switch
                                onChange={() => {
                                    setIsRegisterFilePage(!isRegisterFilePage);
                                    setFileHashHex('');
                                    setWitness('');
                                    setTimestamp('');
                                    setHash('');
                                }}
                                onColor="#308274"
                                offColor="#308274"
                                onHandleColor="#174039"
                                offHandleColor="#174039"
                                checked={!isRegisterFilePage}
                                checkedIcon={false}
                                uncheckedIcon={false}
                            />
                            <button
                                style={isRegisterFilePage ? ButtonStyleNotSelected : ButtonStyleSelected}
                                type="button"
                                onClick={() => {
                                    setIsRegisterFilePage(false);
                                    setFileHashHex('');
                                    setWitness('');
                                    setTimestamp('');
                                    setHash('');
                                }}
                            >
                                Display Tab
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

            <label>
                {activeConnectedAccount !== undefined && (
                    <>
                        <p style={{ marginBottom: 0 }}>Select a file:</p>
                        <input
                            className="input"
                            style={InputFieldStyle}
                            type="file"
                            onChange={changeHandler}
                            ref={file}
                        />
                        <button
                            style={ButtonStyle}
                            type="button"
                            onClick={async () => {
                                try {
                                    if (selectedFile !== undefined) {
                                        setFileHashHex('');
                                        setLoading(true);
                                        const arrayBuffer = await selectedFile.arrayBuffer();
                                        const byteArray = new Uint8Array(arrayBuffer as ArrayBuffer);
                                        const newFileHashHex = sha256(byteArray.toString());
                                        setFileHashHex(newFileHashHex);
                                        setLoading(false);
                                    } else {
                                        alert('Choose a file to compute the file hash');
                                    }
                                } catch (err) {
                                    console.error(setLoadingError((err as Error).message));
                                }
                            }}
                        >
                            Compute File Hash
                        </button>
                        <p style={{ marginBottom: 0 }}>File hash of selected file:</p>
                        {loadingError && <div style={{ color: 'red' }}>Error: {loadingError}.</div>}
                        {isLoading && <div className="loadingText">Loading...</div>}
                        {fileHashHex !== '' && <div className="loadingText">0x{fileHashHex}</div>}
                        <br />
                    </>
                )}
                {!activeConnection && (
                    <button style={ButtonStyleDisabled} type="button" disabled>
                        Waiting for connection...
                    </button>
                )}
                {activeConnection && isRegisterFilePage && activeConnectedAccount && (
                    <button
                        style={fileHashHex === '' ? ButtonStyleDisabled : ButtonStyle}
                        type="button"
                        disabled={fileHashHex === ''}
                        onClick={() => {
                            if (witness !== 'Not registered') {
                                alert(
                                    `This file hash is already registered \n${witness} (withness) \n${timestamp} (timestamp)`
                                );
                            } else {
                                setHash('');
                                setTransactionError('');
                                setWaitingForUser(true);
                                const tx = (isRegisterFilePage ? register : register)(
                                    activeConnection,
                                    activeConnectedAccount,
                                    fileHashHex,
                                    E_SEALING_CONTRACT_INDEX,
                                    CONTRACT_SUB_INDEX
                                );
                                tx.then(setHash)
                                    .catch((err) => setTransactionError((err as Error).message))
                                    .finally(() => setWaitingForUser(false));
                            }
                        }}
                    >
                        Register File Hash
                    </button>
                )}
            </label>
            {activeConnection && activeConnectedAccount && (
                <p>
                    {isRegisterFilePage && (
                        <>
                            <div>Transaction status{hash === '' ? '' : ' (May take a moment to finalize)'}</div>
                            {!hash && transactionError && (
                                <div style={{ color: 'red' }}>Error: {transactionError}.</div>
                            )}
                            {!hash && !transactionError && <div className="loadingText">None</div>}
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
                        </>
                    )}
                    {!isRegisterFilePage && witness !== '' && (
                        <>
                            {getFileError && <div style={{ color: 'red' }}>Error: {getFileError}.</div>}
                            <div>On-chain Record:</div>
                            <div className="loadingText">{witness} (witness)</div>
                            <div className="loadingText">{timestamp} (timestamp)</div>
                        </>
                    )}
                </p>
            )}
            <div>
                <br />
                Version: {version} |{' '}
                <a
                    style={{ color: 'white' }}
                    href="https://developer.concordium.software/en/mainnet/smart-contracts/tutorials/wCCD/index.html"
                    target="_blank"
                    rel="noreferrer"
                >
                    Learn how to make a wrapper like this
                </a>
                <br />
            </div>
        </div>
    );
}
