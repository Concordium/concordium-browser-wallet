import React, { useContext, useMemo } from 'react';
import { AccountTransactionPayload, AccountTransactionType } from '@concordium/web-sdk';
import { useLocation } from 'react-router-dom';

import { convertEnergyToMicroCcd, getEnergyCost } from '@shared/utils/energy-helpers';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
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

    const energyCost = useMemo(() => getEnergyCost(type, payload), [type, payload]);
    const chainParameters = useBlockChainParameters();
    const cost = useMemo(
        () => (energyCost && chainParameters ? convertEnergyToMicroCcd(energyCost, chainParameters) : undefined),
        [energyCost, Boolean(chainParameters)]
    );

    return (
        <ConfirmTransfer setDetailsExpanded={setDetailsExpanded} cost={cost} payload={payload} transactionType={type} />
    );
}
