import React, { useContext, useMemo } from 'react';
import { AccountTransactionPayload, AccountTransactionType, getAccountTransactionHandler } from '@concordium/web-sdk';
import { useLocation } from 'react-router-dom';

import ConfirmTransfer from './ConfirmTransfer';
import { accountPageContext } from './utils';

export type ConfirmGenericTransferState = {
    payload: AccountTransactionPayload;
    type: AccountTransactionType;
};

export default function ConfirmGenericTransfer() {
    const { state } = useLocation();
    const { payload, type } = state as ConfirmGenericTransferState;
    const { setDetailsExpanded } = useContext(accountPageContext);

    const handler = useMemo(() => getAccountTransactionHandler(type), [type]);
    const cost = useMemo(() => handler.getBaseEnergyCost(payload), [handler, payload]); // TODO: calculate cost properly.

    return (
        <ConfirmTransfer setDetailsExpanded={setDetailsExpanded} cost={cost} payload={payload} transactionType={type} />
    );
}
