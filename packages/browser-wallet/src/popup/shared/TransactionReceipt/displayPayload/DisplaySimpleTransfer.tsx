import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleTransferPayload } from '@concordium/web-sdk';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import DisplayAddress, { AddressDisplayFormat } from 'wallet-common-helpers/src/components/DisplayAddress';

interface Props {
    payload: SimpleTransferPayload;
}

/**
 * Displays an overview of a simple transfer.
 */
export default function DisplaySimpleTransfer({ payload }: Props) {
    const { t } = useTranslation('sendTransaction');
    return (
        <>
            <h5>{t('amount')}:</h5>
            <div>{displayAsCcd(payload.amount.microGtuAmount)}</div>
            <h5>{t('receiver')}:</h5>
            <DisplayAddress
                className="transaction-receipt__address"
                address={payload.toAddress.address}
                format={AddressDisplayFormat.DoubleLine}
            />
        </>
    );
}
