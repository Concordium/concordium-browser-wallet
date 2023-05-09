import React from 'react';
import CcdIcon from '@assets/svg/concordium.svg';
import { VerifiableCredential, VerifiableCredentialStatus } from '../../../shared/storage/types';

function StatusIcon({ status }: { status: VerifiableCredentialStatus }) {
    switch (status) {
        case VerifiableCredentialStatus.Active:
        case VerifiableCredentialStatus.Revoked:
        case VerifiableCredentialStatus.Expired:
        case VerifiableCredentialStatus.NotActivated:
        default:
            return <div className="verifiable-credential__header-status">{VerifiableCredentialStatus[status]}</div>;
    }
}

function Logo() {
    return (
        <div className="verifiable-credential__header-logo">
            <CcdIcon />
        </div>
    );
}

/**
 * Provide the required clickable properties if onClick is defined.
 */
function clickableProperties(onClick?: () => void) {
    if (onClick) {
        return {
            onClick,
            onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' && onClick) {
                    onClick();
                }
            },
            role: 'button',
            tabIndex: 0,
        };
    }
    return {};
}

export function VerifiableCredentialCard({
    credential,
    onClick,
}: {
    credential: VerifiableCredential;
    onClick?: () => void;
}) {
    return (
        <div className="verifiable-credential" {...clickableProperties(onClick)}>
            <header>
                <Logo />
                <div className="verifiable-credential__header-title">{credential.title}</div>
                <StatusIcon status={credential.status} />
            </header>
            <div className="verifiable-credential__body-attributes">
                {credential.attributes &&
                    Object.entries(credential.attributes).map((value) => (
                        <div key={value[0]} className="verifiable-credential__body-attributes-row">
                            <label>attribute label {value[0]}</label>
                            <div className="verifiable-credential__body-attributes-row-value">{value[1]}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
