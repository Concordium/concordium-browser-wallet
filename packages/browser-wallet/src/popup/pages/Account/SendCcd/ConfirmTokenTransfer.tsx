import React, { useMemo } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { AccountTransactionType, SimpleTransferPayload, UpdateContractPayload } from '@concordium/web-sdk';
import { jsonRpcClientAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { useLocation } from 'react-router-dom';
import { useAsyncMemo } from 'wallet-common-helpers';
import { fetchContractName, getTokenTransferParameters, getTokenTransferPayload } from '@shared/utils/token-helpers';
import { TokenMetadata } from '@shared/storage/types';
import ConfirmTransfer from './ConfirmTransfer';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
}

interface State extends SimpleTransferPayload {
    contractIndex: string;
    tokenId: string;
    metadata: TokenMetadata;
    executionEnergy: bigint;
}

export default function ConfirmTokenTransfer({ setDetailsExpanded, cost }: Props) {
    const { state } = useLocation();
    const {
        toAddress,
        amount,
        contractIndex,
        tokenId,
        executionEnergy,
        metadata: { symbol = 'CIS-2' },
    } = state as State;
    const selectedAddress = useAtomValue(selectedAccountAtom);
    const client = useAtomValue(jsonRpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const contractName = useAsyncMemo(() => fetchContractName(client, BigInt(contractIndex)), undefined, []);

    const parameters = useMemo(
        () =>
            selectedAddress &&
            getTokenTransferParameters(selectedAddress, toAddress.address, tokenId, amount.microGtuAmount),
        []
    );

    const payload: UpdateContractPayload | undefined = useMemo(() => {
        if (!parameters || !contractName) {
            return undefined;
        }
        try {
            return getTokenTransferPayload(parameters, contractName, BigInt(executionEnergy), BigInt(contractIndex));
        } catch (e) {
            addToast((e as Error).message);
        }
        return undefined;
    }, [contractName]);

    if (!payload || !parameters) {
        return null;
    }

    return (
        <ConfirmTransfer
            showAsTokenTransfer
            symbol={symbol}
            setDetailsExpanded={setDetailsExpanded}
            cost={cost}
            payload={payload}
            parameters={parameters}
            returnState={state}
            transactionType={AccountTransactionType.UpdateSmartContractInstance}
        />
    );
}
