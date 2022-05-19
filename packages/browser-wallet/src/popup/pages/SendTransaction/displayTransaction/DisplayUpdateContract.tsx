import React from 'react';
import { useTranslation } from 'react-i18next';
import { UpdateContract } from '@root/../browser-wallet-api/src/types';

interface Props {
    payload: UpdateContract;
}

/**
 * Displays an overview of a update contract transaction.
 * TODO: make nice, use displayAsCcd for amount
 */
export default function DisplaySimpleTransfer({ payload }: Props) {
    const { t } = useTranslation('displayTransaction');

    return (
        <>
            <h5>{t('contractIndex')}:</h5>
            <p>
                {payload.contractAddressIndex} ({payload.contractAddressSubindex})
            </p>
            <h5>{t('receiveName')}:</h5>
            <p>{payload.receiveName}</p>
            <h5>{t('amount')}:</h5>
            {payload.amount} MicroCCD
            <h5>{t('maxEnergy')}:</h5>
            <p>{payload.maxContractExecutionEnergy} NRG</p>
            {payload.parameter ? (
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
