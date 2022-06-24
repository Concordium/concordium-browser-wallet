import React, { useContext, useCallback, useMemo, useState, useEffect } from 'react';
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
    getAccountTransactionHash,
} from '@concordium/web-sdk';
import { selectedAccountAtom } from '@popup/store/account';
import { jsonRpcUrlAtom, credentialsAtom } from '@popup/store/settings';
import DisplayUpdateContract from './displayTransaction/DisplayUpdateContract';
import DisplayInitContract from './displayTransaction/DisplayInitContract';
import DisplaySimpleTransfer from './displayTransaction/DisplaySimpleTransfer';
import { parsePayload } from './util';

interface Location {
    state: {
        payload: {
            type: AccountTransactionType;
            payload: string;
            parameters?: Record<string, unknown>;
            schema?: string;
        };
    };
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

    const { type: transactionType, payload } = useMemo(
        () => parsePayload(state.payload.type, state.payload.payload, state.payload.parameters, state.payload.schema),
        [JSON.stringify(state.payload)]
    );

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
        const transaction = { payload, header, type: transactionType };

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
            {transactionType === AccountTransactionType.SimpleTransfer && <DisplaySimpleTransfer payload={payload} />}
            {transactionType === AccountTransactionType.UpdateSmartContractInstance && (
                <DisplayUpdateContract payload={payload} parameters={state.payload.parameters} />
            )}
            {transactionType === AccountTransactionType.InitializeSmartContractInstance && (
                <DisplayInitContract payload={payload} parameters={state.payload.parameters} />
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
