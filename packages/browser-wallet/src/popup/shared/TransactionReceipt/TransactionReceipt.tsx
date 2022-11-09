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
import { Cis2TransferParameters, SmartContractParameters } from '@shared/utils/types';
import { TokenMetadata } from '@shared/storage/types';
import { trunctateSymbol } from '@shared/utils/token-helpers';
import DisplayCost from './DisplayCost';
import { getTransactionTypeName } from '../utils/transaction-helpers';
import DisplayUpdateContract from './displayPayload/DisplayUpdateContract';
import DisplayInitContract from './displayPayload/DisplayInitContract';
import DisplaySimpleTransfer from './displayPayload/DisplaySimpleTransfer';
import DisplayGenericPayload from './displayPayload/DisplayGenericPayload';
import TokenBalance from '../TokenBalance';

export type GenericTransactionReceiptProps = {
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

type TransactionReceiptProps = Omit<GenericTransactionReceiptProps, 'transactionType' | 'parameters' | 'payload'> & {
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
            {children}
            <DisplayCost className="transaction-receipt__cost" cost={cost} />
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

export default function GenericTransactionReceipt({
    transactionType,
    parameters,
    payload,
    ...props
}: GenericTransactionReceiptProps) {
    return (
        <TransactionReceipt {...props} title={getTransactionTypeName(transactionType)}>
            {displayPayload({ type: transactionType, payload }, parameters)}
        </TransactionReceipt>
    );
}

export type TokenTransferReceiptProps = GenericTransactionReceiptProps & {
    symbol: string;
    payload: UpdateContractPayload;
    parameters: Cis2TransferParameters;
    metadata: TokenMetadata;
};

export function TokenTransferReceipt({
    transactionType,
    parameters,
    payload,
    symbol,
    metadata,
    ...props
}: TokenTransferReceiptProps) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt.tokenTransfer' });

    const [
        {
            amount,
            from: {
                Account: [from],
            },
            to: {
                Account: [to],
            },
        },
    ] = parameters;

    return (
        <TransactionReceipt {...props} sender={from} title={t('title', { symbol: trunctateSymbol(symbol) })}>
            <>
                <h5>{t('amount')}:</h5>
                <div>
                    <TokenBalance balance={BigInt(amount)} decimals={metadata.decimals ?? 0} symbol={metadata.symbol} />
                </div>
                <h5>{t('receiver')}:</h5>
                <DisplayAddress
                    className="transaction-receipt__address"
                    address={to}
                    format={AddressDisplayFormat.DoubleLine}
                />
            </>
        </TransactionReceipt>
    );
}
