import { CryptographicParameters } from '@concordium/web-sdk';
import { IdentityProvider, SessionPendingIdentity } from '@shared/storage/types';

/** The necessary state for the {@linkcode IdIssuanceExternalFlow} page. */
export type IdIssuanceExternalFlowLocationState = {
    global: CryptographicParameters;
    provider: IdentityProvider;
    pendingIdentity: SessionPendingIdentity;
};
