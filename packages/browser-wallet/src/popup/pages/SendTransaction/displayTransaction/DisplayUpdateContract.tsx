import React from 'react';
import { useTranslation } from 'react-i18next';
import { UpdateContractPayload } from '@concordium/web-sdk';

interface Props {
    payload: Omit<UpdateContractPayload, 'parameter'>;
    parameter: Record<string, unknown> | undefined;
}

/**
 * Displays an overview of a update contract transaction.
 * TODO: make nice, use displayAsCcd for amount
 */
export default function DisplaySimpleTransfer({ payload, parameter }: Props) {
    const { t } = useTranslation('displayTransaction');

    return (
        <>
            <h5>{t('contractIndex')} (Subindex):</h5>
            <p>
                {payload.contractAddress.index.toString()} ({payload.contractAddress.subindex.toString()})
            </p>
            <h5>{t('receiveName')}:</h5>
            <p>{payload.receiveName}</p>
            <h5>{t('amount')}:</h5>
            {payload.amount.microGtuAmount.toString()} MicroCCD
            <h5>{t('maxEnergy')}:</h5>
            <p>{payload.maxContractExecutionEnergy.toString()} NRG</p>
            {parameter ? (
                <>
                    <h5>{t('parameter')}:</h5>
                    <pre className="display-transaction__parameter">{JSON.stringify(parameter, null, 2)}</pre>
                </>
            ) : (
                <h5>{t('noParameter')}:</h5>
            )}
        </>
    );
}
