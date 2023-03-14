/* eslint-disable no-console */
import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import Switch from 'react-switch';
import {
    toBuffer,
    deserializeReceiveReturnValue,
    serializeUpdateContractParameters,
    JsonRpcClient,
} from '@concordium/web-sdk';
import { withJsonRpcClient, WalletConnectionProps, useConnection, useConnect } from '@concordium/react-components';
import { version } from '../package.json';

import { register, mint, submitUpdateOperatorSponsoredTx, submitTransferSponsoredTx } from './utils';
import {
    SPONSORED_TX_CONTRACT_NAME,
    SPONSORED_TX_CONTRACT_INDEX,
    SPONSORED_TX_RAW_SCHEMA,
    CONTRACT_SUB_INDEX,
    BROWSER_WALLET,
    WALLET_CONNECT,
    EXPIRY_TIME_SIGNATURE,
    REFRESH_INTERVAL,
} from './constants';

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

// TODO: deploy a new smart contract so `calcualteMessageHash` can be used.

async function calculateTransferMessageHash(
    rpcClient: JsonRpcClient,
    nonce: number,
    tokenID: string,
    from: string,
    to: string
) {
    const message = {
        contract_address: {
            index: Number(SPONSORED_TX_CONTRACT_INDEX),
            subindex: 0,
        },
        entry_point: 'contract_transfer',
        nonce,
        payload: {
            Transfer: [
                [
                    {
                        amount: '1',
                        data: '',
                        from: {
                            Account: [from],
                        },
                        to: {
                            Account: [to],
                        },
                        token_id: tokenID,
                    },
                ],
            ],
        },
        timestamp: EXPIRY_TIME_SIGNATURE,
    };

    const param = serializeUpdateContractParameters(
        SPONSORED_TX_CONTRACT_NAME,
        'calculateMessageHash',
        message,
        toBuffer(SPONSORED_TX_RAW_SCHEMA, 'base64')
    );

    const res = await rpcClient.invokeContract({
        method: `${SPONSORED_TX_CONTRACT_NAME}.calculateMessageHash`,
        contract: { index: SPONSORED_TX_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: param,
    });

    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(
            `RPC call 'invokeContract' on method '${SPONSORED_TX_CONTRACT_NAME}.calculateMessageHash' of contract '${SPONSORED_TX_CONTRACT_INDEX}' failed`
        );
    }

    return res.returnValue;
}

async function calculateUpdateOperatorMessageHash(
    rpcClient: JsonRpcClient,
    nonce: number,
    operator: string,
    addOperator: boolean
) {
    const operatorAction = addOperator
        ? {
              Add: [],
          }
        : {
              Remove: [],
          };

    const message = {
        contract_address: {
            index: Number(SPONSORED_TX_CONTRACT_INDEX),
            subindex: 0,
        },
        entry_point: 'contract_update_operator',
        nonce,
        payload: {
            UpdateOperator: [
                [
                    {
                        operator: {
                            Account: [operator],
                        },
                        update: operatorAction,
                    },
                ],
            ],
        },
        timestamp: EXPIRY_TIME_SIGNATURE,
    };

    const param = serializeUpdateContractParameters(
        SPONSORED_TX_CONTRACT_NAME,
        'calculateMessageHash',
        message,
        toBuffer(SPONSORED_TX_RAW_SCHEMA, 'base64')
    );

    const res = await rpcClient.invokeContract({
        method: `${SPONSORED_TX_CONTRACT_NAME}.calculateMessageHash`,
        contract: { index: SPONSORED_TX_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: param,
    });

    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(
            `RPC call 'invokeContract' on method '${SPONSORED_TX_CONTRACT_NAME}.calculateMessageHash' of contract '${SPONSORED_TX_CONTRACT_INDEX}' failed`
        );
    }

    return res.returnValue;
}

async function viewPublicKey(rpcClient: JsonRpcClient, account: string) {
    const param = serializeUpdateContractParameters(
        SPONSORED_TX_CONTRACT_NAME,
        'publicKeyOf',
        {
            queries: [
                {
                    account,
                },
            ],
        },
        toBuffer(SPONSORED_TX_RAW_SCHEMA, 'base64')
    );

    const res = await rpcClient.invokeContract({
        method: `${SPONSORED_TX_CONTRACT_NAME}.publicKeyOf`,
        contract: { index: SPONSORED_TX_CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX },
        parameter: param,
    });

    if (!res || res.tag === 'failure' || !res.returnValue) {
        throw new Error(
            `RPC call 'invokeContract' on method '${SPONSORED_TX_CONTRACT_NAME}.publicKeyOf' of contract '${SPONSORED_TX_CONTRACT_INDEX}' failed`
        );
    }

    const returnValues = deserializeReceiveReturnValue(
        toBuffer(res.returnValue, 'hex'),
        toBuffer(SPONSORED_TX_RAW_SCHEMA, 'base64'),
        SPONSORED_TX_CONTRACT_NAME,
        'publicKeyOf',
        2
    );

    if (returnValues === undefined || returnValues[0][0]?.None !== undefined) {
        // [public key, nonce]
        return ['', 0];
    }

    if (returnValues[0][0]?.Some[0][0] !== undefined) {
        // [public key, nonce]
        return [`0x${returnValues[0][0].Some[0][0]}`, returnValues[0][0].Some[0][1]];
    }

    return 'Error';
}

export default function SPONSOREDTXS(props: WalletConnectionProps) {
    const { network, activeConnectorType, activeConnector, activeConnectorError, connectedAccounts, genesisHashes } =
        props;

    const { connection, setConnection, account, genesisHash } = useConnection(connectedAccounts, genesisHashes);
    const { connect, isConnecting, connectError } = useConnect(activeConnector, setConnection);

    const [isLoading, setLoading] = useState(false);
    // TODO: remove
    console.log(isLoading);
    console.log(setLoading);

    const [publicKeyError, setPublicKeyError] = useState('');

    const [fileHashHex, setFileHashHex] = useState('');
    // TODO: remove
    console.log(fileHashHex);
    console.log(setFileHashHex);

    const [selectedFile, setSelectedFile] = useState<File>();
    // TODO: remove
    console.log(setSelectedFile);

    const [isPermitUpdateOperator, setPermitUpdateOperator] = useState<boolean>(true);

    const [userInputPublicKey, setUserInputPublicKey] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [nextNonce, setNextNonce] = useState<number>(0);
    const [operator, setOperator] = useState('4HoVMVsj6TwJr6B5krP5fW9qM4pbo6crVyrr7N95t2UQDrv1fq');
    const [messageHash, setMessageHash] = useState('');
    const [signature, setSignature] = useState('');
    const [tokenID, setTokenID] = useState('1');
    const [to, setTo] = useState('4HoVMVsj6TwJr6B5krP5fW9qM4pbo6crVyrr7N95t2UQDrv1fq');

    const [addOperator, setAddOperator] = useState<boolean>(true);

    const [witness, setWitness] = useState('');
    // TODO: remove
    console.log(setWitness);

    const changeHandler = (event: ChangeEvent) => {
        const target = event.target as HTMLTextAreaElement;
        setUserInputPublicKey(target.value);
    };

    const changeHandler2 = (event: ChangeEvent) => {
        const target = event.target as HTMLTextAreaElement;
        setOperator(target.value);
    };

    const changeHandler3 = (event: ChangeEvent) => {
        const target = event.target as HTMLTextAreaElement;
        setSignature(target.value);
    };

    const changeHandler4 = (event: ChangeEvent) => {
        const target = event.target as HTMLTextAreaElement;
        setTokenID(target.value);
    };

    const changeHandler5 = (event: ChangeEvent) => {
        const target = event.target as HTMLTextAreaElement;
        setTo(target.value);
    };

    // Refresh publicKey/nonce periodically.
    // eslint-disable-next-line consistent-return
    useEffect(() => {
        if (connection && account) {
            const interval = setInterval(() => {
                console.log('refreshing');
                withJsonRpcClient(connection, (rpcClient) => viewPublicKey(rpcClient, account))
                    .then((record) => {
                        if (record !== undefined) {
                            setPublicKey(record[0]);
                            setNextNonce(record[1] + 1);
                        }
                        setPublicKeyError('');
                    })
                    .catch((e) => {
                        setPublicKeyError((e as Error).message);
                        setPublicKey('');
                        setNextNonce(0);
                    });
            }, REFRESH_INTERVAL.asMilliseconds());
            return () => clearInterval(interval);
        }
    }, [connection, account, viewPublicKey]);

    useEffect(() => {
        // View file record.
        if (connection && account) {
            withJsonRpcClient(connection, (rpcClient) => viewPublicKey(rpcClient, account))
                .then((record) => {
                    if (record !== undefined) {
                        setPublicKey(record[0]);
                        setNextNonce(record[1] + 1);
                    }
                    setPublicKeyError('');
                })
                .catch((e) => {
                    setPublicKeyError((e as Error).message);
                    setPublicKey('');
                    setNextNonce(0);
                });
        }
    }, [connection, account]);

    const [isRegisterPublicKeyPage, setIsRegisterPublicKeyPage] = useState(true);
    const [txHash, setTxHash] = useState('');
    const [transactionError, setTransactionError] = useState('');

    const [loadingError, setLoadingError] = useState('');
    // TODO: remove
    console.log(loadingError);

    const file = useRef<HTMLInputElement | null>(null);
    // TODO: remove
    console.log(file);

    const [isWaitingForTransaction, setWaitingForUser] = useState(false);
    return (
        <div style={blackCardStyle}>
            <h1 className="header">Explore Sponsored Transactions</h1>
            <div className="containerSpaceBetween">
                <WalletConnectionTypeButton
                    buttonStyle={ButtonStyle}
                    disabledButtonStyle={ButtonStyleDisabled}
                    connectorType={BROWSER_WALLET}
                    connectorName="Browser Wallet"
                    setWaitingForUser={setWaitingForUser}
                    connection={connection}
                    {...props}
                />
                <WalletConnectionTypeButton
                    buttonStyle={ButtonStyle}
                    disabledButtonStyle={ButtonStyleDisabled}
                    connectorType={WALLET_CONNECT}
                    connectorName="Wallet Connect"
                    setWaitingForUser={setWaitingForUser}
                    connection={connection}
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
                {connectError && <p style={{ color: 'red' }}>Connect Error: {connectError}.</p>}
                {!connection && !isWaitingForTransaction && activeConnectorType && activeConnector && (
                    <p>
                        <button style={ButtonStyle} type="button" onClick={connect}>
                            {isConnecting && 'Connecting...'}
                            {!isConnecting && activeConnectorType === BROWSER_WALLET && 'Connect Browser Wallet'}
                            {!isConnecting && activeConnectorType === WALLET_CONNECT && 'Connect Mobile Wallet'}
                        </button>
                    </p>
                )}
                {account && (
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
                            {account}
                        </button>
                        <br />
                        <br />
                        <div className="containerSpaceBetween">
                            <button
                                style={!isRegisterPublicKeyPage ? ButtonStyleNotSelected : ButtonStyleSelected}
                                type="button"
                                onClick={() => {
                                    setIsRegisterPublicKeyPage(true);
                                    setMessageHash('');
                                    setTxHash('');
                                }}
                            >
                                Register Public Key
                            </button>
                            <Switch
                                onChange={() => {
                                    setIsRegisterPublicKeyPage(!isRegisterPublicKeyPage);
                                    setMessageHash('');
                                    setTxHash('');
                                }}
                                onColor="#308274"
                                offColor="#308274"
                                onHandleColor="#174039"
                                offHandleColor="#174039"
                                checked={!isRegisterPublicKeyPage}
                                checkedIcon={false}
                                uncheckedIcon={false}
                            />
                            <button
                                style={isRegisterPublicKeyPage ? ButtonStyleNotSelected : ButtonStyleSelected}
                                type="button"
                                onClick={() => {
                                    setIsRegisterPublicKeyPage(false);
                                    setMessageHash('');
                                    setTxHash('');
                                }}
                            >
                                Submit Sponsored Tx
                            </button>
                        </div>
                    </>
                )}
                {genesisHash && genesisHash !== network.genesisHash && (
                    <p style={{ color: 'red' }}>
                        Unexpected genesis hash: Please ensure that your wallet is connected to network{' '}
                        <code>{network.name}</code>.
                    </p>
                )}
            </div>
            {connection && isRegisterPublicKeyPage && account !== undefined && (
                <>
                    {!publicKey && (
                        <>
                            <label>
                                <p style={{ marginBottom: 0 }}>Insert your public key:</p>
                                <input
                                    className="input"
                                    style={InputFieldStyle}
                                    type="text"
                                    placeholder="14fe0aed941aa0a0be1119d7b7dd70bfca475310c531f1b5a179b336c075db65"
                                    onChange={changeHandler}
                                />
                            </label>
                            <button
                                style={ButtonStyle}
                                type="button"
                                onClick={() => {
                                    setTxHash('');
                                    setTransactionError('');
                                    setWaitingForUser(true);
                                    const tx = register(connection, account, userInputPublicKey);
                                    tx.then(setTxHash)
                                        .catch((err: Error) => setTransactionError((err as Error).message))
                                        .finally(() => setWaitingForUser(false));
                                }}
                            >
                                Insert a public key
                            </button>
                            <p> Note: The public key you insert above needs to be a lowercase hex value.</p>
                            <p>
                                {' '}
                                For testing, generate a public key (e.g., https://cyphr.me/ed25519_applet/ed.html) and
                                convert it to a lowercase value (e.g.,
                                https://www.convertstring.com/StringFunction/ToLowerCase).
                            </p>
                        </>
                    )}
                    <br />
                    {publicKey !== '' && (
                        <>
                            <div> Your registered public key is: </div>
                            <div className="loadingText">{publicKey}</div>
                            <div> Your next nonce is: </div>
                            <div className="loadingText">{nextNonce}</div>
                        </>
                    )}
                </>
            )}
            {connection && !isRegisterPublicKeyPage && account !== undefined && (
                <>
                    <div className="containerSpaceBetween">
                        <p>Update Operator via a sponsored transaction</p>
                        <Switch
                            onChange={() => {
                                setPermitUpdateOperator(!isPermitUpdateOperator);
                                setMessageHash('');
                                setTxHash('');
                            }}
                            onColor="#308274"
                            offColor="#308274"
                            onHandleColor="#174039"
                            offHandleColor="#174039"
                            checked={!isPermitUpdateOperator}
                            checkedIcon={false}
                            uncheckedIcon={false}
                        />
                        <p>Transfer via a sponsored transaction</p>
                    </div>
                    {isPermitUpdateOperator && (
                        <>
                            <label>
                                <p style={{ marginBottom: 0 }}>Operator Address:</p>
                                <input
                                    className="input"
                                    style={InputFieldStyle}
                                    type="text"
                                    placeholder="4HoVMVsj6TwJr6B5krP5fW9qM4pbo6crVyrr7N95t2UQDrv1fq"
                                    onChange={changeHandler2}
                                />
                            </label>
                            <div className="containerSpaceBetween">
                                <p>Add operator</p>
                                <Switch
                                    onChange={() => {
                                        setAddOperator(!addOperator);
                                    }}
                                    onColor="#308274"
                                    offColor="#308274"
                                    onHandleColor="#174039"
                                    offHandleColor="#174039"
                                    checked={!addOperator}
                                    checkedIcon={false}
                                    uncheckedIcon={false}
                                />
                                <p>Remove operator</p>
                            </div>
                        </>
                    )}
                    {!isPermitUpdateOperator && (
                        <>
                            <div>Mint a token to your account first:</div>
                            <button
                                style={ButtonStyle}
                                type="button"
                                onClick={async () => {
                                    setTxHash('');
                                    setTransactionError('');
                                    setWaitingForUser(true);
                                    const tx = mint(connection, account);
                                    tx.then(setTxHash)
                                        .catch((err: Error) => setTransactionError((err as Error).message))
                                        .finally(() => setWaitingForUser(false));
                                }}
                            >
                                Mint a NFT token
                            </button>
                            <label>
                                <p style={{ marginBottom: 0 }}>Token ID:</p>
                                <input
                                    className="input"
                                    style={InputFieldStyle}
                                    type="text"
                                    placeholder="00000006"
                                    onChange={changeHandler4}
                                />
                            </label>
                            <label>
                                <p style={{ marginBottom: 0 }}>To Address:</p>
                                <input
                                    className="input"
                                    style={InputFieldStyle}
                                    type="text"
                                    placeholder="4HoVMVsj6TwJr6B5krP5fW9qM4pbo6crVyrr7N95t2UQDrv1fq"
                                    onChange={changeHandler5}
                                />
                            </label>
                        </>
                    )}
                    <button
                        style={ButtonStyle}
                        type="button"
                        onClick={async () => {
                            try {
                                if (selectedFile !== undefined) {
                                    // setFileHashHex('');
                                    // setLoading(true);
                                    // const arrayBuffer = await selectedFile.arrayBuffer();
                                    // const byteArray = new Uint8Array(arrayBuffer as ArrayBuffer);
                                    // const newFileHashHex = sha256(byteArray.toString());
                                    // setFileHashHex(newFileHashHex);
                                    // setLoadingError('');
                                    // setLoading(false);
                                } else {
                                    withJsonRpcClient(connection, (rpcClient) => {
                                        return isPermitUpdateOperator
                                            ? calculateUpdateOperatorMessageHash(
                                                  rpcClient,
                                                  nextNonce,
                                                  operator,
                                                  addOperator
                                              )
                                            : calculateTransferMessageHash(rpcClient, nextNonce, tokenID, account, to);
                                    }).then((res) => setMessageHash(res));
                                }
                            } catch (err) {
                                setLoadingError((err as Error).message);
                            }
                        }}
                    >
                        Compute Hash
                    </button>
                    {messageHash !== '' && <div className="loadingText">0x{messageHash}</div>}
                    <label>
                        <p style={{ marginBottom: 0 }}>Insert Signature:</p>
                        <input
                            className="input"
                            style={InputFieldStyle}
                            type="text"
                            placeholder="E34407940B2996979118A2A94DBCE9C56F26E7B8F557F27BBA49E3B7536F0B1495203563E4E272CFCDECE545BE8EA96A1BEE55B1111DA780DE98CCD6F3C59909"
                            onChange={changeHandler3}
                        />
                    </label>
                    <br />
                    <br />
                    {publicKey !== '' && (
                        <>
                            <div> Your registered public key is: </div>
                            <div className="loadingText">{publicKey}</div>
                            <div> Your next nonce is: </div>
                            <div className="loadingText">{nextNonce}</div>
                        </>
                    )}
                    <p>
                        {' '}
                        Note: To generate the signature for testing, copy your the associated private key to the above
                        public key to (e.g., https://cyphr.me/ed25519_applet/ed.html) and insert the above-computed hash
                        without the `0x` into the message field in (e.g., https://cyphr.me/ed25519_applet/ed.html).
                        Select `hex` for the `Msg Encoding` in (e.g., https://cyphr.me/ed25519_applet/ed.html). Click
                        the `Sign` button on (e.g., https://cyphr.me/ed25519_applet/ed.html). Copy the generated
                        signature from (e.g., https://cyphr.me/ed25519_applet/ed.html) to this website into the above
                        input field. Remove the `0x` of the signature before clicking the `Submit Sponsored Transaction`
                        button.
                    </p>
                    <button
                        style={ButtonStyle}
                        type="button"
                        onClick={async () => {
                            if (witness !== null) {
                                // eslint-disable-next-line no-alert
                                // alert(
                                //     `This file hash is already registered \n${witness} (withness) \n${timestamp} (timestamp)`
                                // );
                                // TODO: remove this below again and move to else {} claus once this checking can be done
                                setTxHash('');
                                setTransactionError('');
                                setWaitingForUser(true);
                                const tx = isPermitUpdateOperator
                                    ? submitUpdateOperatorSponsoredTx(
                                          connection,
                                          account,
                                          nextNonce,
                                          signature,
                                          operator,
                                          addOperator
                                      )
                                    : submitTransferSponsoredTx(
                                          connection,
                                          account,
                                          nextNonce,
                                          signature,
                                          tokenID,
                                          account,
                                          to
                                      );
                                tx.then(setTxHash)
                                    .catch((err: Error) => setTransactionError((err as Error).message))
                                    .finally(() => setWaitingForUser(false));
                            } else {
                                setTxHash('');
                                setTransactionError('');
                                setWaitingForUser(true);
                                const tx = submitUpdateOperatorSponsoredTx(
                                    connection,
                                    account,
                                    nextNonce,
                                    signature,
                                    operator,
                                    addOperator
                                );
                                tx.then(setTxHash)
                                    .catch((err: Error) => setTransactionError((err as Error).message))
                                    .finally(() => setWaitingForUser(false));
                            }
                        }}
                    >
                        Submit Sponsored Transaction
                    </button>
                </>
            )}
            {!connection && (
                <button style={ButtonStyleDisabled} type="button" disabled>
                    Waiting for connection...
                </button>
            )}
            {connection && account && (
                <p>
                    {isRegisterPublicKeyPage && !publicKey && (
                        <>
                            <div>Transaction status{txHash === '' ? '' : ' (May take a moment to finalize)'}</div>
                            {!txHash && transactionError && (
                                <div style={{ color: 'red' }}>Error: {transactionError}.</div>
                            )}
                            {!txHash && !transactionError && <div className="loadingText">None</div>}
                            {txHash && (
                                <>
                                    <button
                                        className="link"
                                        type="button"
                                        onClick={() => {
                                            window.open(
                                                `https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${txHash}`,
                                                '_blank',
                                                'noopener,noreferrer'
                                            );
                                        }}
                                    >
                                        {txHash}
                                    </button>
                                    <br />
                                </>
                            )}
                        </>
                    )}
                    {!isRegisterPublicKeyPage && publicKey && (
                        <>
                            <div>Transaction status{txHash === '' ? '' : ' (May take a moment to finalize)'}</div>
                            {!txHash && transactionError && (
                                <div style={{ color: 'red' }}>Error: {transactionError}.</div>
                            )}
                            {!txHash && !transactionError && <div className="loadingText">None</div>}
                            {txHash && (
                                <>
                                    <button
                                        className="link"
                                        type="button"
                                        onClick={() => {
                                            window.open(
                                                `https://testnet.ccdscan.io/?dcount=1&dentity=transaction&dhash=${txHash}`,
                                                '_blank',
                                                'noopener,noreferrer'
                                            );
                                        }}
                                    >
                                        {txHash}
                                    </button>
                                    <br />
                                </>
                            )}
                        </>
                    )}
                    {publicKeyError && <div style={{ color: 'red' }}>Error: {publicKeyError}.</div>}
                </p>
            )}
            <div>
                <br />
                Version: {version} |{' '}
                <a
                    style={{ color: 'white' }}
                    href="https://developer.concordium.software/en/mainnet/smart-contracts/tutorials/"
                    target="_blank"
                    rel="noreferrer"
                >
                    Learn more about sponsored tx here
                </a>
                <br />
            </div>
        </div>
    );
}
