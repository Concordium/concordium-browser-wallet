import React, { useMemo } from 'react';
import { AccountTransactionType } from '@concordium/web-sdk';
import { useLocation } from 'react-router-dom';
import { buildSimpleTransferPayload } from '@popup/shared/utils/transaction-helpers';
import ConfirmTransfer from './ConfirmTransfer';
import { ConfirmSimpleTransferState } from './util';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
}

export default function ConfirmSimpleTransfer({ setDetailsExpanded, cost }: Props) {
    const { state } = useLocation() as { state: ConfirmSimpleTransferState };

    const payload = useMemo(() => buildSimpleTransferPayload(state.toAddress, state.amount), [state]);

    return (
        <ConfirmTransfer
            setDetailsExpanded={setDetailsExpanded}
            cost={cost}
            payload={payload}
            returnState={payload}
            transactionType={AccountTransactionType.Transfer}
        />
    );
}
