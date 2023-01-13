import React from 'react';
import { useTranslation } from 'react-i18next';
import { UpdateContractPayload } from '@concordium/web-sdk';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import DisplayParameters from '../DisplayParameters';

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
            <DisplayParameters parameters={parameters} />
        </>
    );
}
