import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import React from 'react';
import DisplayAddress, { AddressDisplayFormat } from 'wallet-common-helpers/src/components/DisplayAddress';
import { chunkString } from 'wallet-common-helpers';
import {
    AccountTransactionType,
    AccountTransaction,
    AccountTransactionPayload,
    SimpleTransferPayload,
    UpdateContractPayload,
    InitContractPayload,
} from '@concordium/web-sdk';
import { SmartContractParameters } from '@shared/utils/types';
import DisplayCost from './DisplayCost';
import { getTransactionTypeName } from '../utils/transaction-helpers';
import DisplayUpdateContract from './displayPayload/DisplayUpdateContract';
import DisplayInitContract from './displayPayload/DisplayInitContract';
import DisplaySimpleTransfer from './displayPayload/DisplaySimpleTransfer';
import DisplayGenericPayload from './displayPayload/DisplayGenericPayload';

type Props = {
    className?: string;
    transactionType: AccountTransactionType;
    payload: AccountTransactionPayload;
    parameters?: SmartContractParameters;
    sender: string;
    cost?: bigint;
    hash?: string;
};

function displayPayload({ payload, type }: Omit<AccountTransaction, 'header'>, parameters?: SmartContractParameters) {
    switch (type) {
        case AccountTransactionType.SimpleTransfer:
            return <DisplaySimpleTransfer payload={payload as SimpleTransferPayload} />;
        case AccountTransactionType.UpdateSmartContractInstance:
            return <DisplayUpdateContract payload={payload as UpdateContractPayload} parameters={parameters} />;
        case AccountTransactionType.InitializeSmartContractInstance:
            return <DisplayInitContract payload={payload as InitContractPayload} parameters={parameters} />;
        default:
            return <DisplayGenericPayload payload={payload} />;
    }
}

type TransactionReceiptProps = Omit<Props, 'transactionType' | 'parameters' | 'payload'> & {
    title: string;
    children: JSX.Element;
};

function TransactionReceipt({ className, sender, hash, cost, title, children }: TransactionReceiptProps) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    return (
        <div className={clsx('transaction-receipt', className)}>
            <p className="transaction-receipt__title">{title}</p>
            <h5>{t('sender')}</h5>
            <DisplayAddress
                className="transaction-receipt__address"
                address={sender}
                format={AddressDisplayFormat.DoubleLine}
            />
            <DisplayCost className="transaction-receipt__cost" cost={cost} />
            {children}
            {hash && (
                <div className="transaction-receipt__hash">
                    {chunkString(hash, 32).map((chunk) => (
                        <p key={chunk} className="m-0 mono">
                            {chunk}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function GenericTransactionReceipt({ transactionType, parameters, payload, ...props }: Props) {
    return (
        <TransactionReceipt {...props} title={getTransactionTypeName(transactionType)}>
            {displayPayload({ type: transactionType, payload }, parameters)}
        </TransactionReceipt>
    );
}

type TokenTransferReceiptProps = Props & {
    symbol: string;
};

export function TokenTransferReceipt({
    transactionType,
    parameters,
    payload,
    symbol,
    ...props
}: TokenTransferReceiptProps) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    return (
        <TransactionReceipt {...props} title={t('tokenTransfer.title', { symbol })}>
            <div>test</div>
        </TransactionReceipt>
    );
}
