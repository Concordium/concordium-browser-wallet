import React, { useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { Buffer } from 'buffer/';
import { useAtomValue } from 'jotai';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
    AccountTransactionType,
    JsonRpcClient,
    HttpProvider,
    AccountAddress,
    buildBasicAccountSigner,
    signTransaction,
    TransactionExpiry,
    serializeUpdateContractParameters,
    AccountTransactionPayload,
    getAccountTransactionHash,
    GtuAmount,
} from '@concordium/web-sdk';
import { selectedAccountAtom } from '@popup/store/account';
import { jsonRpcUrlAtom, credentialsAtom } from '@popup/store/settings';
import { SimplifiedAccountTransaction } from '@root/../browser-wallet-api/src/types';
import DisplayUpdateContract from './displayTransaction/DisplayUpdateContract';
import DisplaySimpleTransfer from './displayTransaction/DisplaySimpleTransfer';

interface Location {
    state: {
        payload: {
            transaction: SimplifiedAccountTransaction;
        };
    };
}

function transformPayload(transaction: SimplifiedAccountTransaction): AccountTransactionPayload {
    switch (transaction.type) {
        case AccountTransactionType.SimpleTransfer:
            return {
                amount: new GtuAmount(BigInt(transaction.amount)),
                toAddress: new AccountAddress(transaction.toAddress),
            };

        case AccountTransactionType.UpdateSmartContractInstance: {
            const [contractName, functionName] = transaction.receiveName.split('.');
            return {
                amount: new GtuAmount(BigInt(transaction.amount)),
                contractAddress: {
                    index: BigInt(transaction.contractAddressIndex),
                    subindex: BigInt(transaction.contractAddressSubindex),
                },
                receiveName: transaction.receiveName,
                maxContractExecutionEnergy: BigInt(transaction.maxContractExecutionEnergy),
                parameter: transaction.parameter
                    ? serializeUpdateContractParameters(
                          contractName,
                          functionName,
                          transaction.parameter,
                          Buffer.from(transaction.schema, 'base64')
                      )
                    : Buffer.alloc(0),
            };
        }
        default:
            throw new Error('Unsupported transaction type');
    }
}

interface Props {
    onSubmit(hash: string): void;
    onReject(): void;
}

export default function SendTransaction({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('sendTransaction');
    const [error, setError] = useState<string>();
    const address = useAtomValue(selectedAccountAtom);
    const creds = useAtomValue(credentialsAtom);
    const url = useAtomValue(jsonRpcUrlAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);

    const rawTransaction = state.payload.transaction;
    const payload = useMemo(() => transformPayload(rawTransaction), [JSON.stringify(rawTransaction)]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const sendTransaction = useCallback(async () => {
        if (!url || !address) {
            throw new Error('Missing url for JsonRpc or account address');
        }
        const key = creds.find((c) => c.address === address)?.key;
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }

        // TODO: Maybe we should not create the client for each transaction sent
        const client = new JsonRpcClient(new HttpProvider(url));
        const sender = new AccountAddress(address);
        const nonce = await client.getNextAccountNonce(sender);

        if (!nonce) {
            throw new Error('No nonce was found for the chosen account');
        }

        const header = {
            // TODO: add better default?
            expiry: new TransactionExpiry(new Date(Date.now() + 3600000)),
            sender,
            nonce: nonce.nonce,
        };
        const transaction = { payload, header, type: rawTransaction.type };

        const signature = await signTransaction(transaction, buildBasicAccountSigner(key));
        const result = await client.sendAccountTransaction(transaction, signature);

        if (!result) {
            throw new Error('transaction was rejected by the node');
        }

        return getAccountTransactionHash(transaction, signature);
    }, [payload]);

    return (
        <>
            <div>{t('description')}</div>
            <h5>{t('sender')}:</h5>
            <p className="send-transaction__address">{address}</p>
            {rawTransaction.type === AccountTransactionType.SimpleTransfer && (
                <DisplaySimpleTransfer payload={rawTransaction} />
            )}
            {rawTransaction.type === AccountTransactionType.UpdateSmartContractInstance && (
                <DisplayUpdateContract payload={rawTransaction} />
            )}
            <br />
            <button
                type="button"
                onClick={() =>
                    sendTransaction()
                        .then(withClose(onSubmit))
                        .catch((e) => setError(e.message))
                }
            >
                {t('submit')}
            </button>
            <button type="button" onClick={withClose(onReject)}>
                {t('deny')}
            </button>
            {error && (
                <p>
                    {t('error')}: {error}
                </p>
            )}
        </>
    );
}
