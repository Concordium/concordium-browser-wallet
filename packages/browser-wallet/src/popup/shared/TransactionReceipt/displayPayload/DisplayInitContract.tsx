import React from 'react';
import { useTranslation } from 'react-i18next';
import { InitContractInput } from '@concordium/web-sdk';
import { displayAsCcd } from 'wallet-common-helpers';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import DisplayParameters from '../DisplayParameters';

interface Props {
    payload: Omit<InitContractInput, 'param'>;
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
            <div>{payload.initName.value}</div>
            <h5>{t('amount')}:</h5>
            {displayAsCcd(payload.amount.microCcdAmount)}
            <h5>{t('maxEnergy')}:</h5>
            <span>
                {payload.maxContractExecutionEnergy.value.toString()} {t('nrg')}
            </span>
            <DisplayParameters parameters={parameters} />
        </>
    );
}
