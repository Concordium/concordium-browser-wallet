import React, { useContext, useCallback, useMemo, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AccountAddress, convertEnergyToMicroCcd, getEnergyCost } from '@concordium/web-sdk';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import {
    sendTransaction,
    getDefaultExpiry,
    createPendingTransactionFromAccountTransaction,
    getTransactionAmount,
} from '@popup/shared/utils/transaction-helpers';
import { grpcClientAtom } from '@popup/store/settings';
import TransactionReceipt from '@popup/shared/TransactionReceipt/TransactionReceipt';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import ConnectedBox from '@popup/pages/Account/ConnectedBox';
import { addToastAtom } from '@popup/state';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { useUpdateAtom } from 'jotai/utils';
import { addPendingTransactionAtom } from '@popup/store/transactions';
import { parsePayload } from '@shared/utils/payload-helpers';
import { BackgroundSendTransactionPayload } from '@shared/utils/types';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { getPublicAccountAmounts } from 'wallet-common-helpers';
import * as JSONBig from 'json-bigint';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';

interface Location {
    state: {
        payload: BackgroundSendTransactionPayload;
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
    const client = useAtomValue(grpcClientAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);
    const chainParameters = useBlockChainParameters();

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
    const parameters = useMemo(
        () =>
            state.payload.parameters === undefined
                ? undefined
                : (JSONBig.parse(state.payload.parameters) as SmartContractParameters),
        [state.payload.parameters]
    );

    const cost = useMemo(() => {
        if (chainParameters) {
            const energy = getEnergyCost(transactionType, payload);
            return convertEnergyToMicroCcd(energy, chainParameters);
        }
        return undefined;
    }, [transactionType, chainParameters]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleSubmit = useCallback(async () => {
        if (!accountAddress) {
            throw new Error(t('errors.missingAccount'));
        }
        if (!key) {
            throw new Error(t('errors.missingKey'));
        }

        const sender = AccountAddress.fromBase58(accountAddress);
        const accountInfo = await client.getAccountInfo(sender);
        if (
            getPublicAccountAmounts(accountInfo).atDisposal <
            getTransactionAmount(transactionType, payload) + (cost?.microCcdAmount || 0n)
        ) {
            throw new Error(t('errors.insufficientFunds'));
        }

        const nonce = await client.getNextAccountNonce(sender);

        if (!nonce) {
            throw new Error(t('errors.missingNonce'));
        }

        const header = {
            expiry: getDefaultExpiry(),
            sender,
            nonce: nonce.nonce,
        };
        const transaction = { payload, header, type: transactionType };

        const hash = await sendTransaction(client, transaction, key);
        const pending = createPendingTransactionFromAccountTransaction(transaction, hash, cost?.microCcdAmount);
        await addPendingTransaction(pending);

        return hash;
    }, [payload, key, cost]);

    return (
        <ExternalRequestLayout className="p-10">
            <ConnectedBox accountAddress={accountAddress} url={new URL(url).origin} />
            <div className="h-full flex-column align-center">
                <h3 className="m-t-0 text-center">{t('description', { dApp: displayUrl(url) })}</h3>
                <TransactionReceipt
                    transactionType={transactionType}
                    payload={payload}
                    parameters={parameters}
                    sender={accountAddress}
                    cost={cost?.microCcdAmount}
                    className="m-10"
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
