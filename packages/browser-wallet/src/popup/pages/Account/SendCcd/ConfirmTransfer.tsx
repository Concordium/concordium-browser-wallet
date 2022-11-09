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
import { jsonRpcClientAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
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
import { Cis2TransferParameters, SmartContractParameters } from '@shared/utils/types';
import { TokenMetadata } from '@shared/storage/types';

type BaseProps = {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    returnState: any;
};

type ConfirmTokenTransferProps = BaseProps & {
    showAsTokenTransfer: true;
    transactionType: AccountTransactionType.UpdateSmartContractInstance;
    payload: UpdateContractPayload;
    parameters: SmartContractParameters;
    symbol: string;
    metadata: TokenMetadata;
};

type ConfirmGenericTransferProps = BaseProps & {
    showAsTokenTransfer?: false;
    payload: AccountTransactionPayload;
    transactionType: AccountTransactionType;
    parameters?: SmartContractParameters;
    symbol: undefined;
};

type Props = ConfirmTokenTransferProps | ConfirmGenericTransferProps;

export default function ConfirmTransfer(props: Props) {
    const { setDetailsExpanded, cost, transactionType, payload, returnState, parameters } = props;
    const { t } = useTranslation('account');
    const [hash, setHash] = useState<string>();
    const selectedAddress = useAtomValue(selectedAccountAtom);
    const address = useMemo(() => selectedAddress, []);
    const key = usePrivateKey(address);
    const client = useAtomValue(jsonRpcClientAtom);
    const nav = useNavigate();
    const addToast = useSetAtom(addToastAtom);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);

    useEffect(() => {
        if (selectedAddress !== address) {
            nav('../');
        }
    }, [selectedAddress]);

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    const send = async () => {
        if (!address || !key) {
            throw new Error('Missing address or key for selected account');
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
        const transactionHash = await sendTransaction(client, transaction, key);

        addPendingTransaction(createPendingTransactionFromAccountTransaction(transaction, transactionHash, cost));
        setHash(transactionHash);
    };

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
        className: 'send-ccd__receipt',
    };

    return (
        <div className="w-full flex-column justify-space-between align-center">
            {props.showAsTokenTransfer ? (
                <TokenTransferReceipt
                    {...commonProps}
                    symbol={props.symbol}
                    payload={props.payload}
                    metadata={props.metadata}
                    parameters={props.parameters as Cis2TransferParameters}
                />
            ) : (
                <GenericTransactionReceipt {...commonProps} />
            )}
            {!hash && (
                <div className="flex justify-center p-b-10 m-h-20">
                    <Button width="narrow" className="m-r-10" onClick={() => nav(`../`, { state: returnState })}>
                        {t('sendCcd.buttons.back')}
                    </Button>
                    <Button width="narrow" onClick={() => send().catch((e) => addToast(e.toString()))}>
                        {t('sendCcd.buttons.send')}
                    </Button>
                </div>
            )}
            {hash && (
                <div className="p-b-10">
                    <Button width="medium" className="m-b-10" onClick={() => nav(absoluteRoutes.home.account.path)}>
                        {t('sendCcd.buttons.finish')}
                    </Button>
                </div>
            )}
        </div>
    );
}
