import React from 'react';
import { AccountTransactionType, SimpleTransferPayload } from '@concordium/web-sdk';
import { useLocation } from 'react-router-dom';
import ConfirmTransfer from './ConfirmTransfer';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
}

type State = SimpleTransferPayload;

export default function ConfirmSimpleTransfer({ setDetailsExpanded, cost }: Props) {
    const { state } = useLocation();
    const payload = state as State;
    return (
        <ConfirmTransfer
            setDetailsExpanded={setDetailsExpanded}
            cost={cost}
            payload={payload}
            returnState={payload}
            transactionType={AccountTransactionType.SimpleTransfer}
        />
    );
}
