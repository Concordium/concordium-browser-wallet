import React from 'react';
import { useTranslation } from 'react-i18next';
import { UpdateContractPayload } from '@concordium/web-sdk';

interface Props {
    payload: UpdateContractPayload;
}

/**
 * Displays an overview of a update contract transaction.
 * TODO: make nice, use displayAsCcd for amount
 */
export default function DisplayUpdateContract({ payload }: Props) {
    const { t } = useTranslation('displayTransaction');

    return (
        <>
            <h5>{t('contractIndex')}:</h5>
            <p>
                {payload.contractAddress.index.toString()} ({payload.contractAddress.subindex.toString()})
            </p>
            <h5>{t('receiveName')}:</h5>
            <p>{payload.receiveName}</p>
            <h5>{t('amount')}:</h5>
            {payload.amount.microGtuAmount.toString()} MicroCCD
            <h5>{t('maxEnergy')}:</h5>
            <p>{payload.maxContractExecutionEnergy.toString()} NRG</p>
            {payload.parameter.length ? (
                <>
                    <h5>{t('parameter')}:</h5>
                    <pre className="display-transaction__parameter">{JSON.stringify(payload.parameter, null, 2)}</pre>
                </>
            ) : (
                <h5>{t('noParameter')}:</h5>
            )}
        </>
    );
}
