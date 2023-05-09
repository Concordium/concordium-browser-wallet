import React from 'react';
import { storedVerifiableCredentialsAtom } from '@popup/store/verifiable-credential';
import { useAtomValue } from 'jotai';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';

/**
 * Component to display when there are no verifiable credentials in the wallet.
 */
function NoVerifiableCredentials() {
    return (
        <div className="flex-column align-center h-full">
            <p className="m-t-20 m-h-30">You do not have any verifiable credentials in your wallet.</p>
        </div>
    );
}

/**
 * Renders all verifiable credentials that are in the wallet. The credentials
 * are selectable by clicking them, which will move the user to a view containing
 * a single credential.
 */
export default function VerifiableCredentialList() {
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);

    if (!verifiableCredentials) {
        return <NoVerifiableCredentials />;
    }

    return (
        <>
            {verifiableCredentials.map((credential, index) => {
                // eslint-disable-next-line react/no-array-index-key
                return <VerifiableCredentialCard key={index} credential={credential} />;
            })}
        </>
    );
}
