import React, { PropsWithChildren } from 'react';
import CcdIcon from '@assets/svg/concordium.svg';
import { useAtomValue } from 'jotai';
import { storedVerifiableCredentialSchemasAtom } from '@popup/store/verifiable-credential';
import {
    VerifiableCredential,
    VerifiableCredentialStatus,
    VerifiableCredentialSchema,
} from '../../../shared/storage/types';

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
 * Renders a credential using the applied schema. The schema is used to determine the correct
 * label for the attribute value.
 * @param credential the credential to render
 * @param schema the schema for the credential
 * @throws if there is a mismatch in fields between the credential and the schema, i.e. the schema is invalid.
 */
function DisplayAttribute({
    attributeKey,
    attributeValue,
    schema,
}: {
    attributeKey: string;
    attributeValue: string | number;
    schema: VerifiableCredentialSchema;
}) {
    const attributeSchema = schema.schema.properties.credentialSubject.properties[attributeKey];
    return (
        <div key={attributeKey} className="verifiable-credential__body-attributes-row">
            <label>{attributeSchema.title.toLowerCase()}</label>
            <div className="verifiable-credential__body-attributes-row-value">{attributeValue}</div>
        </div>
    );
}

/**
 * Wraps children components in a verifiable credential card that is clickable if onClick
 * is defined.
 */
function ClickableVerifiableCredential({ children, onClick }: PropsWithChildren<{ onClick?: () => void }>) {
    if (onClick) {
        return (
            <div
                className="verifiable-credential"
                onClick={onClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        onClick();
                    }
                }}
                role="button"
                tabIndex={0}
            >
                {children}
            </div>
        );
    }
    return <div className="verifiable-credential">{children}</div>;
}

export function VerifiableCredentialCard({
    credential,
    onClick,
}: {
    credential: VerifiableCredential;
    onClick?: () => void;
}) {
    const schemas = useAtomValue(storedVerifiableCredentialSchemasAtom);
    if (schemas.loading) {
        return null;
    }
    if (!Object.keys(schemas.value).length) {
        throw new Error('Attempted to render a verifiable credential, but no schemas were found.');
    } else if (!schemas.value[credential.credentialSchema.id]) {
        throw new Error(`No schema with id: ${credential.credentialSchema.id}`);
    }
    const schema = schemas.value[credential.credentialSchema.id];

    return (
        <ClickableVerifiableCredential onClick={onClick}>
            <header>
                <Logo />
                <div className="verifiable-credential__header-title">{credential.type[0]}</div>
                <StatusIcon status={VerifiableCredentialStatus.Active} />
            </header>
            <div className="verifiable-credential__body-attributes">
                {credential.credentialSubject &&
                    Object.entries(credential.credentialSubject).map((value) => (
                        <DisplayAttribute
                            key={value[0]}
                            attributeKey={value[0]}
                            attributeValue={value[1]}
                            schema={schema}
                        />
                    ))}
            </div>
        </ClickableVerifiableCredential>
    );
}
