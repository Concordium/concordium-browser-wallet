import React from 'react';
import { useTranslation } from 'react-i18next';
import { UpdateContractPayload } from '@concordium/web-sdk';

interface Props {
    payload: UpdateContractPayload;
    parameters?: Record<string, unknown>;
}

/**
 * Displays an overview of a update contract transaction.
 * TODO: make nice, use displayAsCcd for amount
 */
export default function DisplayUpdateContract({ payload, parameters }: Props) {
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
            {!!parameters && (
                <>
                    <h5>{t('parameter')}:</h5>
                    <pre className="display-transaction__parameter">{JSON.stringify(parameters, null, 2)}</pre>
                </>
            )}
            {!parameters && !!payload.parameter.length && (
                <>
                    <h5>{t('parameter')} (hex):</h5>
                    <pre className="display-transaction__parameter">
                        {JSON.stringify(payload.parameter.toString('hex'), null, 2)}
                    </pre>
                </>
            )}
            {!parameters && !payload.parameter.length && <h5>{t('noParameter')}:</h5>}
        </>
    );
}
