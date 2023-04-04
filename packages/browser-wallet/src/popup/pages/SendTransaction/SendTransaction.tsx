import React, { useContext, useCallback, useMemo, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AccountTransactionType, AccountAddress, SchemaVersion } from '@concordium/web-sdk';
import { useCredential } from '@popup/shared/utils/account-helpers';
import {
    sendTransaction,
    getDefaultExpiry,
    createPendingTransactionFromAccountTransaction,
} from '@popup/shared/utils/transaction-helpers';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import TransactionReceipt from '@popup/shared/TransactionReceipt/TransactionReceipt';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import ConnectedBox from '@popup/pages/Account/ConnectedBox';
import { addToastAtom } from '@popup/state';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { useUpdateAtom } from 'jotai/utils';
import { addPendingTransactionAtom } from '@popup/store/transactions';
import { convertEnergyToMicroCcd, getEnergyCost } from '@shared/utils/energy-helpers';
import { SmartContractParameters, SchemaWithContext } from '@concordium/browser-wallet-api-helpers';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { getNet } from '@shared/utils/network-helpers';
import { useLedger } from '@concordium/ledger-bindings/react/LedgerProvider';
import { ConcordiumLedgerClient } from '@concordium/ledger-bindings';
import { parsePayload } from './util';

interface Location {
    state: {
        payload: {
            accountAddress: string;
            type: AccountTransactionType;
            payload: string;
            parameters?: SmartContractParameters;
            schema?: SchemaWithContext;
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
    const client = useAtomValue(grpcClientAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);
    const chainParameters = useBlockChainParameters();
    const { accountAddress, url } = state.payload;
    const cred = useCredential(accountAddress);
    const network = useAtomValue(networkConfigurationAtom);

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

    const cost = useMemo(() => {
        if (chainParameters) {
            const energy = getEnergyCost(transactionType, payload);
            return convertEnergyToMicroCcd(energy, chainParameters);
        }
        return undefined;
    }, [transactionType, chainParameters]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleSubmit = useCallback(
        async (ledgerClient: ConcordiumLedgerClient) => {
            if (!accountAddress) {
                throw new Error('Missing url account address');
            }
            if (!cred) {
                throw new Error('Missing credential for the chosen address');
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
            const hash = await sendTransaction(client, transaction, cred, ledgerClient, getNet(network));
            const pending = createPendingTransactionFromAccountTransaction(transaction, hash, cost);
            await addPendingTransaction(pending);

            onSubmit(hash);
        },
        [payload, cred, cost]
    );

    const { submitHandler } = useLedger(handleSubmit, (e) => addToast(e.message));

    return (
        <ExternalRequestLayout>
            <ConnectedBox accountAddress={accountAddress} url={new URL(url).origin} />
            <div className="h-full flex-column align-center">
                <h3 className="m-t-0 text-center">{t('description', { dApp: displayUrl(url) })}</h3>
                <TransactionReceipt
                    transactionType={transactionType}
                    payload={payload}
                    parameters={state.payload.parameters}
                    sender={accountAddress}
                    cost={cost}
                    className="m-10"
                />
                <br />
                <div className="flex p-b-10 m-t-auto">
                    <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                        {t('deny')}
                    </Button>
                    <Button width="narrow" onClick={withClose(submitHandler)}>
                        {t('submit')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
