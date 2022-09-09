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
    parameters?: Record<string, unknown>;
    sender: string;
    cost?: bigint;
    hash?: string;
};

function displayPayload({ payload, type }: Omit<AccountTransaction, 'header'>, parameters?: Record<string, unknown>) {
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

export default function TransactionReceipt({
    transactionType,
    sender,
    cost = 0n,
    hash,
    className,
    payload,
    parameters,
}: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    return (
        <div className={clsx('transaction-receipt', className)}>
            <p className="transaction-receipt__title">{getTransactionTypeName(transactionType)}</p>
            <h5>{t('sender')}</h5>
            <DisplayAddress
                className="transaction-receipt__address"
                address={sender}
                format={AddressDisplayFormat.DoubleLine}
            />
            {displayPayload({ type: transactionType, payload }, parameters)}
            <DisplayCost cost={cost} />
            {hash && (
                <div className="transaction-receipt__hash">
                    {chunkString(hash, 32).map((chunk) => (
                        <p className="m-0">{chunk}</p>
                    ))}
                </div>
            )}
        </div>
    );
}
