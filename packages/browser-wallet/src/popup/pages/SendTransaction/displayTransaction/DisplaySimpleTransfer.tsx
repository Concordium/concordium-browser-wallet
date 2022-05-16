import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleTransferPayload } from '@concordium/web-sdk';

interface Props {
    payload: SimpleTransferPayload;
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
            <p className="display-transaction__address">{payload.toAddress.address}</p>
            <h5>{t('amount')}:</h5>
            {payload.amount.microGtuAmount.toString()} MicroCCD
        </>
    );
}
