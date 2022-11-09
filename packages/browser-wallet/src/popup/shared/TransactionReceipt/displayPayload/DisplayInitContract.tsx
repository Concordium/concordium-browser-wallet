import React from 'react';
import { useTranslation } from 'react-i18next';
import { InitContractPayload } from '@concordium/web-sdk';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import { SmartContractParameters } from '@shared/utils/types';

interface Props {
    payload: InitContractPayload;
    parameters?: SmartContractParameters;
}

/**
 * Displays an overview of a init contract transaction.
 */
export default function DisplayInitContract({ payload, parameters }: Props) {
    const { t } = useTranslation('sendTransaction');

    return (
        <>
            <h5>{t('moduleReference')}:</h5>
            <div className="transaction-receipt__module-ref">{payload.moduleRef.moduleRef}</div>
            <h5>{t('contractName')}:</h5>
            <p>{payload.contractName}</p>
            <h5>{t('amount')}:</h5>
            {displayAsCcd(payload.amount.microGtuAmount)}
            <h5>{t('maxEnergy')}:</h5>
            <span>
                {payload.maxContractExecutionEnergy.toString()} {t('nrg')}
            </span>
            {!!parameters && (
                <>
                    <h5>{t('parameter')}:</h5>
                    <pre className="transaction-receipt__parameter">{JSON.stringify(parameters, null, 2)}</pre>
                </>
            )}
            {!parameters && !!payload.parameter.length && (
                <>
                    <h5>{t('parameter')} (hex):</h5>
                    <pre className="transaction-receipt__parameter">
                        {JSON.stringify(payload.parameter.toString('hex'), null, 2)}
                    </pre>
                </>
            )}
            {!parameters && !payload.parameter.length && <h5>{t('noParameter')}</h5>}
        </>
    );
}
