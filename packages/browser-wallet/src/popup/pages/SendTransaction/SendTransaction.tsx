import React, { useContext, useCallback, useMemo, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AccountTransactionType, AccountAddress, SchemaVersion } from '@concordium/web-sdk';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import {
    sendTransaction,
    getDefaultExpiry,
    createPendingTransactionFromAccountTransaction,
} from '@popup/shared/utils/transaction-helpers';
import { jsonRpcClientAtom } from '@popup/store/settings';
import TransactionReceipt from '@popup/shared/TransactionReceipt/TransactionReceipt';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { noOp, useAsyncMemo } from 'wallet-common-helpers';
import { getSimpleTransferCost } from '@popup/shared/utils/wallet-proxy';
import ConnectedBox from '@popup/pages/Account/ConnectedBox';
import { addToastAtom } from '@popup/state';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { useUpdateAtom } from 'jotai/utils';
import { addPendingTransactionAtom } from '@popup/store/transactions';
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
            url: string;
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
    const addToast = useSetAtom(addToastAtom);
    const client = useAtomValue(jsonRpcClientAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);

    const { accountAddress, url } = state.payload;
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
    const cost = useAsyncMemo(
        transactionType === AccountTransactionType.SimpleTransfer
            ? getSimpleTransferCost
            : () => Promise.resolve(undefined),
        noOp,
        [transactionType]
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
            expiry: getDefaultExpiry(),
            sender,
            nonce: nonce.nonce,
        };
        const transaction = { payload, header, type: transactionType };

        const hash = await sendTransaction(client, transaction, key);
        addPendingTransaction(createPendingTransactionFromAccountTransaction(transaction, hash));

        return hash;
    }, [payload, key]);

    return (
        <ExternalRequestLayout>
            <ConnectedBox accountAddress={accountAddress} url={new URL(url).origin} />
            <div className="h-full flex-column align-center">
                <div>{t('description', { dApp: displayUrl(url) })}</div>
                <TransactionReceipt
                    transactionType={transactionType}
                    payload={payload}
                    parameters={state.payload.parameters}
                    sender={accountAddress}
                    cost={cost}
                    className="m-v-10"
                />
                <br />
                <div className="flex p-b-10 m-t-auto">
                    <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                        {t('deny')}
                    </Button>
                    <Button
                        width="narrow"
                        onClick={() =>
                            handleSubmit()
                                .then(withClose(onSubmit))
                                .catch((e) => addToast(e.message))
                        }
                    >
                        {t('submit')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
