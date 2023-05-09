import React, { useState } from 'react';
import { storedVerifiableCredentialsAtom } from '@popup/store/verifiable-credential';
import { useAtomValue } from 'jotai';
import { VerifiableCredential } from '@shared/storage/types';
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
    const [selected, setSelected] = useState<VerifiableCredential>();

    if (!verifiableCredentials) {
        return <NoVerifiableCredentials />;
    }
    if (selected) {
        return <VerifiableCredentialCard credential={selected} />;
    }

    return (
        <>
            {verifiableCredentials.map((credential, index) => {
                return (
                    <VerifiableCredentialCard
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        credential={credential}
                        onClick={() => setSelected(credential)}
                    />
                );
            })}
        </>
    );
}
