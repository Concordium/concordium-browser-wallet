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

export function VerifiableCredentialCard({ credential }: { credential: VerifiableCredential }) {
    return (
        <div className="verifiable-credential">
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
