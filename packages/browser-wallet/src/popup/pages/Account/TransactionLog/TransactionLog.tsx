import { BrowserWalletTransaction } from '@popup/shared/utils/transaction-history-types';
import { selectedAccountAtom } from '@popup/store/account';
import { useAtomValue } from 'jotai';
import React, { useContext, useEffect, useState } from 'react';
import { useUpdateEffect } from 'wallet-common-helpers';
import { ensureDefined } from '@shared/utils/basic-helpers';
import TransactionList from './TransactionList';
import TransactionDetails from './TransactionDetails';
import { accountPageContext } from '../utils';

export default function TransactionLog() {
    const accountAddress = ensureDefined(useAtomValue(selectedAccountAtom), 'Expected account to be defined');
    const [selectedTransaction, setSelectedTransaction] = useState<BrowserWalletTransaction>();
    const { setDetailsExpanded } = useContext(accountPageContext);

    const showList = () => {
        setSelectedTransaction(undefined);
    };

    useEffect(() => {
        setDetailsExpanded(true);
    }, []);

    useUpdateEffect(showList, [accountAddress]);

    if (selectedTransaction) {
        return (
            <TransactionDetails accountAddress={accountAddress} transaction={selectedTransaction} onClose={showList} />
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
