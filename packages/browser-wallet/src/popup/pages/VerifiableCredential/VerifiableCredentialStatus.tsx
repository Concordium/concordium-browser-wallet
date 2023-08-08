import { VerifiableCredentialStatus } from '@shared/storage/types';
import React from 'react';
import RevokedIcon from '@assets/svg/revoked.svg';
import ActiveIcon from '@assets/svg/verified.svg';
import ExpiredIcon from '@assets/svg/block.svg';
import PendingIcon from '@assets/svg/pending.svg';

/**
 * Component for displaying the status of a verifiable credential.
 */
export default function StatusIcon({ status }: { status: VerifiableCredentialStatus }) {
    let icon = null;
    switch (status) {
        case VerifiableCredentialStatus.Active:
            icon = <ActiveIcon />;
            break;
        case VerifiableCredentialStatus.Revoked:
            icon = <RevokedIcon />;
            break;
        case VerifiableCredentialStatus.Expired:
            icon = <ExpiredIcon />;
            break;
        case VerifiableCredentialStatus.NotActivated:
            icon = <PendingIcon />;
            break;
        default:
            icon = null;
            break;
    }

    return (
        <div className="verifiable-credential__header__status">
            {VerifiableCredentialStatus[status]}
            {icon}
        </div>
    );
}
