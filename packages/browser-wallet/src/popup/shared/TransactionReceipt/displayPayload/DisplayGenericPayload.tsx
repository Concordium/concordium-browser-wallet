import React from 'react';
import { AccountTransactionPayload, AccountAddress, CcdAmount } from '@concordium/web-sdk';
import { displayAsCcd, DisplayAddress, AddressDisplayFormat } from 'wallet-common-helpers';

interface Props {
    payload: AccountTransactionPayload;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function displayValue(value: any) {
    if (value instanceof AccountAddress) {
        return (
            <DisplayAddress
                className="transaction-receipt__address"
                address={value.address}
                format={AddressDisplayFormat.DoubleLine}
            />
        );
    }
    if (value instanceof CcdAmount) {
        return <p className="m-t-0">{displayAsCcd(value.microCcdAmount)}</p>;
    }
    return <p className="m-t-0">{value.toString()}</p>;
}

/**
 * Displays an overview of any transaction payload.
 */
export default function DisplayGenericPayload({ payload }: Props) {
    return (
        <>
            {Object.entries(payload).map(([key, value]) => (
                <>
                    <h5>{key}:</h5>
                    {displayValue(value)}
                </>
            ))}
        </>
    );
}
