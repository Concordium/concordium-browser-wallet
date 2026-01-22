import React from 'react';

import LedgerIcon from '@assets/svgX/ledger-icon.svg';
import { IdentityProvider, IdentityType } from '@shared/storage/types';

interface Props {
    provider?: IdentityProvider;
    identityType?: IdentityType;
}

export default function IdentityProviderIcon({ provider, identityType }: Props) {
    if (identityType === IdentityType.LedgerBased) {
        return (
            <LedgerIcon
                className="identity-provider-icon identity-provider-icon--ledger"
                role="img"
                aria-label="Ledger identity"
            />
        );
    }

    return (
        <img
            className="identity-provider-icon"
            src={`data:image/png;base64, ${provider?.metadata?.icon}`}
            alt={provider?.ipInfo?.ipDescription?.name || 'Unknown'}
        />
    );
}
