import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { AccountTransactionType, UpdateContractPayload } from '@concordium/web-sdk';
import { grpcClientAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { useLocation } from 'react-router-dom';
import { useAsyncMemo } from 'wallet-common-helpers';
import { fetchContractName, getTokenTransferParameters, getTokenTransferPayload } from '@shared/utils/token-helpers';
import ConfirmTransfer from '../ConfirmTransfer';
import { ConfirmTokenTransferState } from './util';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
}

export default function ConfirmTokenTransfer({ setDetailsExpanded, cost }: Props) {
    const { t } = useTranslation('account');
    const { state } = useLocation();
    const { toAddress, amount, contractIndex, tokenId, executionEnergy, metadata } = state as ConfirmTokenTransferState;
    const selectedAddress = useAtomValue(selectedAccountAtom);
    const client = useAtomValue(grpcClientAtom);
    const addToast = useSetAtom(addToastAtom);
    const contractName = useAsyncMemo(() => fetchContractName(client, BigInt(contractIndex)), undefined, []);

    const parameters = useMemo(
        () => selectedAddress && getTokenTransferParameters(selectedAddress, toAddress, tokenId, amount),
        []
    );

    const payload: UpdateContractPayload | undefined = useMemo(() => {
        if (!parameters || !contractName) {
            return undefined;
        }
        try {
            return getTokenTransferPayload(
                parameters,
                contractName,
                BigInt(executionEnergy || 0),
                BigInt(contractIndex)
            );
        } catch (e) {
            addToast(t('sendCcd.unableToCreatePayload', { message: (e as Error).message }));
        }
        return undefined;
    }, [contractName]);

    if (!payload || !parameters) {
        return null;
    }

    return (
        <ConfirmTransfer
            showAsTokenTransfer
            metadata={metadata}
            setDetailsExpanded={setDetailsExpanded}
            cost={cost}
            payload={payload}
            parameters={parameters}
            transactionType={AccountTransactionType.Update}
        />
    );
}
