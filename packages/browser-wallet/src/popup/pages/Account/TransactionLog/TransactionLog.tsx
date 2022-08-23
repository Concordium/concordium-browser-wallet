import { BrowserWalletTransaction } from '@popup/shared/utils/transaction-history-types';
import { selectedAccountAtom } from '@popup/store/account';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import TransactionList from './TransactionList';
import TransactionDetails from './TransactionDetails';

export default function TransactionLog({
    setDetailsExpanded,
}: {
    setDetailsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const accountAddress = useAtomValue(selectedAccountAtom);
    const [selectedTransaction, setSelectedTransaction] = useState<BrowserWalletTransaction>();

    if (!accountAddress) {
        return null;
    }

    if (selectedTransaction) {
        return (
            <TransactionDetails
                accountAddress={accountAddress}
                transaction={selectedTransaction}
                onClose={() => {
                    setSelectedTransaction(undefined);
                    setDetailsExpanded(true);
                }}
            />
        );
    }
    return (
        <TransactionList
            onTransactionClick={(transaction) => {
                setSelectedTransaction(transaction);
                setDetailsExpanded(false);
            }}
        />
    );
}
