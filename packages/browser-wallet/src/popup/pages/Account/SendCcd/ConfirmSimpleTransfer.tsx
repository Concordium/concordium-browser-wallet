import React from 'react';
import { AccountTransactionType, SimpleTransferPayload } from '@concordium/web-sdk';
import { useLocation } from 'react-router-dom';
import ConfirmTransfer from '../ConfirmTransfer';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
}

export type ConfirmSimpleTransferState = SimpleTransferPayload;

export default function ConfirmSimpleTransfer({ setDetailsExpanded, cost }: Props) {
    const { state } = useLocation();
    return (
        <ConfirmTransfer
            setDetailsExpanded={setDetailsExpanded}
            cost={cost}
            payload={state as ConfirmSimpleTransferState}
            transactionType={AccountTransactionType.Transfer}
        />
    );
}
