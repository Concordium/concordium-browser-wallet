import { VerifiableCredentialStatus } from '@shared/storage/types';
import React from 'react';
import RevokedIcon from '@assets/svg/revoked.svg';
import ActiveIcon from '@assets/svg/verified.svg';
import ExpiredIcon from '@assets/svg/block.svg';
import PendingIcon from '@assets/svg/pending.svg';
import { useTranslation } from 'react-i18next';

/**
 * Component for displaying the status of a verifiable credential.
 */
export default function StatusIcon({ status }: { status: VerifiableCredentialStatus }) {
    const { t } = useTranslation('verifiableCredential', { keyPrefix: 'status' });

    let icon = null;
    let text = '';
    switch (status) {
        case VerifiableCredentialStatus.Active:
            icon = <ActiveIcon />;
            text = t('Active');
            break;
        case VerifiableCredentialStatus.Revoked:
            icon = <RevokedIcon />;
            text = t('Revoked');
            break;
        case VerifiableCredentialStatus.Expired:
            icon = <ExpiredIcon />;
            text = t('Expired');
            break;
        case VerifiableCredentialStatus.NotActivated:
            icon = <PendingIcon />;
            text = t('Pending');
            break;
        case VerifiableCredentialStatus.Pending:
            icon = <PendingIcon />;
            text = t('Pending');
            break;
        default:
            icon = null;
            break;
    }

    return (
        <div className="verifiable-credential__header__status">
            {text}
            {icon}
        </div>
    );
}
