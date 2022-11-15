/* eslint-disable react/destructuring-assignment */
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
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
import { getMetadataDecimals } from '@shared/utils/token-helpers';
import DisplayCost from './DisplayCost';
import { getTransactionTypeName } from '../utils/transaction-helpers';
import DisplayUpdateContract from './displayPayload/DisplayUpdateContract';
import DisplayInitContract from './displayPayload/DisplayInitContract';
import DisplaySimpleTransfer from './displayPayload/DisplaySimpleTransfer';
import DisplayGenericPayload from './displayPayload/DisplayGenericPayload';
import TokenBalance from '../TokenBalance';
import Button from '../Button';

export type GenericTransactionReceiptProps = {
    className?: string;
    transactionType: AccountTransactionType;
    payload: AccountTransactionPayload;
    parameters?: SmartContractParameters;
    sender: string;
    cost?: bigint;
    hash?: string;
};

type TransactionReceiptProps = GenericTransactionReceiptProps & {
    onAlternate?(): void;
    alternateText?: string;
};

type TransactionReceiptViewProps = Omit<TransactionReceiptProps, 'transactionType' | 'parameters' | 'payload'> & {
    title: string;
    children: JSX.Element;
};

export type TokenTransferReceiptProps = GenericTransactionReceiptProps & {
    payload: UpdateContractPayload;
    parameters: Cis2TransferParameters;
    metadata: TokenMetadata;
};

function displayPayload({ payload, type }: Omit<AccountTransaction, 'header'>, parameters?: SmartContractParameters) {
    switch (type) {
        case AccountTransactionType.Transfer:
            return <DisplaySimpleTransfer payload={payload as SimpleTransferPayload} />;
        case AccountTransactionType.Update:
            return <DisplayUpdateContract payload={payload as UpdateContractPayload} parameters={parameters} />;
        case AccountTransactionType.InitContract:
            return <DisplayInitContract payload={payload as InitContractPayload} parameters={parameters} />;
        default:
            return <DisplayGenericPayload payload={payload} />;
    }
}

function TransactionReceiptView(props: TransactionReceiptViewProps) {
    const { className, sender, hash, cost, title, children, onAlternate, alternateText = '' } = props;
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
            {onAlternate !== undefined && (
                <Button clear onClick={onAlternate} className="m-t-10 color-cta">
                    {alternateText}
                </Button>
            )}
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

function TransactionReceipt({ transactionType, parameters, payload, ...props }: TransactionReceiptProps) {
    return (
        <TransactionReceiptView {...props} title={getTransactionTypeName(transactionType)}>
            {displayPayload({ type: transactionType, payload }, parameters)}
        </TransactionReceiptView>
    );
}

export default function GenericTransactionReceipt(props: GenericTransactionReceiptProps) {
    return <TransactionReceipt {...props} />;
}

export function TokenTransferReceipt({ parameters, metadata, ...props }: TokenTransferReceiptProps) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt.tokenTransfer' });
    const [advanced, setAdvanced] = useState(false);

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

    if (advanced) {
        return (
            <TransactionReceipt
                {...props}
                parameters={parameters}
                onAlternate={() => setAdvanced(false)}
                alternateText={t('showTransfer')}
            />
        );
    }

    const tokenName = metadata.name ?? metadata.symbol ?? 'CIS-2 Token';

    return (
        <TransactionReceiptView
            {...props}
            sender={from}
            title={t('title', { tokenName })}
            onAlternate={() => setAdvanced(true)}
            alternateText={t('showContract')}
        >
            <>
                <h5>{t('amount')}:</h5>
                <div>
                    <TokenBalance
                        balance={BigInt(amount)}
                        decimals={getMetadataDecimals(metadata)}
                        symbol={metadata.symbol}
                    />
                </div>
                <h5>{t('receiver')}:</h5>
                <DisplayAddress
                    className="transaction-receipt__address"
                    address={to}
                    format={AddressDisplayFormat.DoubleLine}
                />
            </>
        </TransactionReceiptView>
    );
}
