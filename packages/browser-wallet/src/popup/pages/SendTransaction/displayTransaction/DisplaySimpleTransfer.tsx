import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleTransfer } from '@root/../browser-wallet-api/src/types';

interface Props {
    payload: SimpleTransfer;
}

/**
 * Displays an overview of a simple transfer.
 * TODO: make nice, use displayAsCcd for amount
 */
export default function DisplaySimpleTransfer({ payload }: Props) {
    const { t } = useTranslation('displayTransaction');
    return (
        <>
            <h5>{t('receiver')}:</h5>
            <p className="display-transaction__address">{payload.toAddress}</p>
            <h5>{t('amount')}:</h5>
            {payload.amount} MicroCCD
        </>
    );
}
