import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleTransferPayload } from '@concordium/web-sdk';
import { displayAsCcd } from '@shared/utils/ccd';

interface Props {
    payload: SimpleTransferPayload;
}

/**
 * Displays an overview of a simple transfer.
 * TODO: make nice
 */
export default function DisplaySimpleTransfer({ payload }: Props) {
    const { t } = useTranslation('sendTransaction');
    return (
        <>
            <h5>{t('receiver')}:</h5>
            <p className="display-transaction__address">{payload.toAddress.address}</p>
            <h5>{t('amount')}:</h5>
            {displayAsCcd(payload.amount.microGtuAmount)}
        </>
    );
}
