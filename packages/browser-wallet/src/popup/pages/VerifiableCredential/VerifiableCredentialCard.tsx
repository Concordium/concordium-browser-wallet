import React, { PropsWithChildren } from 'react';
import RevokedIcon from '@assets/svg/revoked.svg';
import ActiveIcon from '@assets/svg/verified.svg';
import ExpiredIcon from '@assets/svg/block.svg';
import PendingIcon from '@assets/svg/pending.svg';
import { VerifiableCredentialMetadata } from '@shared/utils/verifiable-credential-helpers';
import Img from '@popup/shared/Img';
import {
    VerifiableCredential,
    VerifiableCredentialStatus,
    VerifiableCredentialSchema,
    MetadataUrl,
} from '../../../shared/storage/types';

function StatusIcon({ status }: { status: VerifiableCredentialStatus }) {
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

function Logo({ logo }: { logo: MetadataUrl }) {
    return <Img className="verifiable-credential__header__logo" src={logo.url} withDefaults />;
}

function DisplayImage({ image }: { image: MetadataUrl }) {
    return <Img src={image.url} withDefaults />;
}

/**
 * Renders a verifiable credential attribute.
 */
function DisplayAttribute({
    attributeKey,
    attributeValue,
    attributeTitle,
}: {
    attributeKey: string;
    attributeValue: string | number;
    attributeTitle: string;
}) {
    return (
        <div key={attributeKey} className="verifiable-credential__body-attributes-row">
            <label>{attributeTitle.toLowerCase()}</label>
            <div className="verifiable-credential__body-attributes-row-value">{attributeValue}</div>
        </div>
    );
}

/**
 * Wraps children components in a verifiable credential card that is clickable if onClick
 * is defined.
 */
function ClickableVerifiableCredential({
    children,
    onClick,
    metadata,
}: PropsWithChildren<{ onClick?: () => void; metadata: VerifiableCredentialMetadata }>) {
    if (onClick) {
        return (
            <div
                className="verifiable-credential"
                style={{ backgroundColor: metadata.background_color }}
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
    return (
        <div className="verifiable-credential" style={{ backgroundColor: metadata.background_color }}>
            {children}
        </div>
    );
}

/**
 * Apply the schema to an attribute, adding the index and title from the schema. The index
 * should be used for sorting, and the title should be displayed to a user.
 * @param schema the schema to apply
 * @returns the attribute together with its index and title.
 * @throws if there is a mismatch in fields between the credential and the schema, i.e. the schema is invalid.
 */
function applySchema(
    schema: VerifiableCredentialSchema
): (value: [string, string | number]) => { index: number; title: string; key: string; value: string | number } {
    return (value: [string, string | number]) => {
        const attributeSchema = schema.properties.credentialSubject.properties[value[0]];
        if (!attributeSchema) {
            throw new Error(`Missing attribute schema for key: ${value[0]}`);
        }
        return {
            index: Number(attributeSchema.index),
            title: attributeSchema.title,
            key: value[0],
            value: value[1],
        };
    };
}

export function VerifiableCredentialCard({
    credential,
    schema,
    onClick,
    credentialStatus,
    metadata,
}: {
    credential: VerifiableCredential;
    schema: VerifiableCredentialSchema;
    credentialStatus: VerifiableCredentialStatus;
    onClick?: () => void;
    metadata: VerifiableCredentialMetadata;
}) {
    const attributes = Object.entries(credential.credentialSubject)
        .filter((val) => val[0] !== 'id')
        .map(applySchema(schema))
        .sort((a, b) => a.index - b.index);

    return (
        <ClickableVerifiableCredential onClick={onClick} metadata={metadata}>
            <header className="verifiable-credential__header">
                <Logo logo={metadata.logo} />
                <div className="verifiable-credential__header__title">{metadata.title}</div>
                <StatusIcon status={credentialStatus} />
            </header>
            {metadata.image && (
                <div className="verifiable-credential__image">
                    <DisplayImage image={metadata.image} />
                </div>
            )}
            <div className="verifiable-credential__body-attributes">
                {attributes &&
                    attributes.map((attribute) => (
                        <DisplayAttribute
                            key={attribute.key}
                            attributeKey={attribute.key}
                            attributeValue={attribute.value}
                            attributeTitle={attribute.title}
                        />
                    ))}
            </div>
        </ClickableVerifiableCredential>
    );
}
