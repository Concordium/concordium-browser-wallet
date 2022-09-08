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
            <h5 className="m-b-10">{t('amount')}:</h5>
            <p className="m-t-0">{displayAsCcd(payload.amount.microGtuAmount)}</p>
            <h5 className="m-b-10">{t('receiver')}:</h5>
            <DisplayAddress
                className="transaction-receipt__address"
                address={payload.toAddress.address}
                format={AddressDisplayFormat.DoubleLine}
            />
        </>
    );
}
