import { IdentityProvider } from '@shared/utils/wallet-proxy';
import React from 'react';

interface Props {
    provider: IdentityProvider;
}

export default function IdentityProviderIcon({ provider }: Props) {
    return (
        <img
            className="identity-provider-icon"
            src={`data:image/png;base64, ${provider?.metadata?.icon}`}
            alt={provider.ipInfo.ipDescription.name || 'Unknown'}
        />
    );
}
