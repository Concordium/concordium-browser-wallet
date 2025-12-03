import React, { useContext, useMemo } from 'react';
import {
    AccountTransactionInput,
    AccountTransactionType,
    convertEnergyToMicroCcd,
    getEnergyCost,
} from '@concordium/web-sdk';
import { useLocation } from 'react-router-dom';

import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import ConfirmTransfer from './ConfirmTransfer';
import { accountPageContext } from './utils';

export type ConfirmGenericTransferState = {
    payload: AccountTransactionInput;
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
        <ConfirmTransfer
            setDetailsExpanded={setDetailsExpanded}
            cost={cost?.microCcdAmount}
            payload={payload}
            transactionType={type}
        />
    );
}
