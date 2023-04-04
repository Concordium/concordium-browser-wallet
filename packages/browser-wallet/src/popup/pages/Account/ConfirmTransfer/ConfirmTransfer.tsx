/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import {
    AccountAddress,
    AccountTransactionPayload,
    AccountTransactionType,
    UpdateContractPayload,
} from '@concordium/web-sdk';
import {
    getDefaultExpiry,
    createPendingTransactionFromAccountTransaction,
    sendTransaction,
} from '@popup/shared/utils/transaction-helpers';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import Button from '@popup/shared/Button';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import GenericTransactionReceipt, {
    TokenTransferReceipt,
    GenericTransactionReceiptProps,
    TokenTransferReceiptProps,
} from '@popup/shared/TransactionReceipt';
import { useUpdateAtom } from 'jotai/utils';
import { addPendingTransactionAtom } from '@popup/store/transactions';
import { Cis2TransferParameters } from '@shared/utils/types';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import { TokenMetadata } from '@shared/storage/types';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { getNet } from '@shared/utils/network-helpers';
import { useLedger } from '@concordium/ledger-bindings/react/LedgerProvider';
import { accountRoutes } from '../routes';

type BaseProps = {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
};

type ConfirmTokenTransferProps = BaseProps & {
    showAsTokenTransfer: true;
    transactionType: AccountTransactionType.Update;
    payload: UpdateContractPayload;
    parameters: SmartContractParameters;
    metadata: TokenMetadata;
};

type ConfirmGenericTransferProps = BaseProps & {
    showAsTokenTransfer?: false;
    payload: AccountTransactionPayload;
    transactionType: AccountTransactionType;
    parameters?: SmartContractParameters;
};

type Props = ConfirmTokenTransferProps | ConfirmGenericTransferProps;

export default function ConfirmTransfer(props: Props) {
    const { setDetailsExpanded, cost, transactionType, payload, parameters } = props;
    const { t } = useTranslation('account');
    const [hash, setHash] = useState<string>();
    const selectedAddress = useAtomValue(selectedAccountAtom);
    const address = useMemo(() => selectedAddress, []);
    const client = useAtomValue(grpcClientAtom);
    const nav = useNavigate();
    const addToast = useSetAtom(addToastAtom);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);
    const cred = useSelectedCredential();
    const network = useAtomValue(networkConfigurationAtom);

    const { submitHandler } = useLedger(
        async (ledgerClient) => {
            if (!address || !cred) {
                throw new Error('Missing address or credential for selected account');
            }
            const sender = new AccountAddress(address);
            const nonce = await client.getNextAccountNonce(sender);
            if (!nonce) {
                throw new Error('No nonce found for sender');
            }
            const header = {
                expiry: getDefaultExpiry(),
                sender,
                nonce: nonce.nonce,
            };
            const transaction = { payload, header, type: transactionType };
            const transactionHash = await sendTransaction(client, transaction, cred, ledgerClient, getNet(network));

            addPendingTransaction(createPendingTransactionFromAccountTransaction(transaction, transactionHash, cost));
            setHash(transactionHash);
        },
        (e) => addToast(e.toString())
    );

    useEffect(() => {
        if (selectedAddress !== address) {
            nav('../');
        }
    }, [selectedAddress]);

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    if (!address) {
        return null;
    }

    type CommonProps = GenericTransactionReceiptProps | TokenTransferReceiptProps;
    const commonProps: CommonProps = {
        transactionType,
        sender: address,
        parameters,
        payload,
        cost,
        hash,
        className: 'confirm-transfer__receipt',
    };

    return (
        <div className="w-full flex-column justify-space-between align-center">
            {props.showAsTokenTransfer ? (
                <TokenTransferReceipt
                    {...commonProps}
                    payload={props.payload}
                    metadata={props.metadata}
                    parameters={props.parameters as Cis2TransferParameters}
                />
            ) : (
                <GenericTransactionReceipt {...commonProps} />
            )}
            {!hash && (
                <div className="flex justify-center p-b-10 m-h-20">
                    <Button width="narrow" className="m-r-10" onClick={() => nav(-1)}>
                        {t('confirmTransfer.buttons.back')}
                    </Button>
                    <Button width="narrow" onClick={submitHandler}>
                        {t('confirmTransfer.buttons.send')}
                    </Button>
                </div>
            )}
            {hash && (
                <div className="p-b-10">
                    <Button
                        width="medium"
                        className="m-b-10"
                        onClick={() => nav(`${absoluteRoutes.home.account.path}/${accountRoutes.log}`)}
                    >
                        {t('confirmTransfer.buttons.finish')}
                    </Button>
                </div>
            )}
        </div>
    );
}
