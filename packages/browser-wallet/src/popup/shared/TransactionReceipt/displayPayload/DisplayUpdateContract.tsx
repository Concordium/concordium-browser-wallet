import React from 'react';
import { useTranslation } from 'react-i18next';
import { UpdateContractPayload } from '@concordium/web-sdk';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import { SmartContractParameters } from '@shared/utils/types';

interface Props {
    payload: Omit<UpdateContractPayload, 'message'>;
    parameters?: SmartContractParameters;
}

/**
 * Displays an overview of a update contract transaction.
 */
export default function DisplayUpdateContract({ payload, parameters }: Props) {
    const { t } = useTranslation('sendTransaction');

    return (
        <>
            <h5>{t('contractIndex')}:</h5>
            <div>
                {payload.address.index.toString()} ({payload.address.subindex.toString()})
            </div>
            <h5>{t('receiveName')}:</h5>
            <div>{payload.receiveName}</div>
            <h5>{t('amount')}:</h5>
            {displayAsCcd(payload.amount.microCcdAmount)}
            <h5>{t('maxEnergy')}:</h5>
            <div>
                {payload.maxContractExecutionEnergy.toString()} {t('nrg')}
            </div>
            {!!parameters && (
                <>
                    <h5 className="m-b-5">{t('parameter')}:</h5>
                    <pre className="transaction-receipt__parameter">{JSON.stringify(parameters, null, 2)}</pre>
                </>
            )}
            {!parameters && <h5>{t('noParameter')}</h5>}
        </>
    );
}
