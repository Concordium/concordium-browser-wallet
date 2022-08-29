import React, { useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AccountTransactionType, AccountAddress, TransactionExpiry, SchemaVersion } from '@concordium/web-sdk';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { sendTransaction } from '@popup/shared/utils/transaction-helpers';
import { jsonRpcClientAtom } from '@popup/store/settings';
import DisplayUpdateContract from './displayTransaction/DisplayUpdateContract';
import DisplayInitContract from './displayTransaction/DisplayInitContract';
import DisplaySimpleTransfer from './displayTransaction/DisplaySimpleTransfer';
import { parsePayload } from './util';

interface Location {
    state: {
        payload: {
            accountAddress: string;
            type: AccountTransactionType;
            payload: string;
            parameters?: Record<string, unknown>;
            schema?: string;
            schemaVersion?: SchemaVersion;
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
    const client = useAtomValue(jsonRpcClientAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);

    const { accountAddress } = state.payload;
    const key = usePrivateKey(accountAddress);

    const { type: transactionType, payload } = useMemo(
        () =>
            parsePayload(
                state.payload.type,
                state.payload.payload,
                state.payload.parameters,
                state.payload.schema,
                state.payload.schemaVersion
            ),
        [JSON.stringify(state.payload)]
    );

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleSubmit = useCallback(async () => {
        if (!accountAddress) {
            throw new Error('Missing url account address');
        }
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }

        const sender = new AccountAddress(accountAddress);
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

        return sendTransaction(client, transaction, key);
    }, [payload, key]);

    return (
        <>
            <div>{t('description')}</div>
            <h5>{t('sender')}:</h5>
            <p className="send-transaction__address">{accountAddress}</p>
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
                    handleSubmit()
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
