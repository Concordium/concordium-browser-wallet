import React, { PropsWithChildren } from 'react';
import { ClassName } from 'wallet-common-helpers';
import clsx from 'clsx';
import { VerifiableCredentialMetadata } from '@shared/utils/verifiable-credential-helpers';
import Img from '@popup/shared/Img';
import { AttributeType, CredentialSubject } from '@concordium/web-sdk';
import { VerifiableCredentialStatus, MetadataUrl, VerifiableCredentialSchema } from '@shared/storage/types';
import StatusIcon from './VerifiableCredentialStatus';

function Logo({ logo }: { logo: MetadataUrl }) {
    return <Img className="verifiable-credential__header__logo" src={logo.url} withDefaults />;
}

function DisplayImage({ image }: { image: MetadataUrl }) {
    return (
        <div className="verifiable-credential__image">
            <Img src={image.url} withDefaults />
        </div>
    );
}

/**
 * Renders a verifiable credential attribute.
 */
export function DisplayAttribute({
    attributeKey,
    attributeValue,
    attributeTitle,
}: {
    attributeKey: string;
    attributeValue: AttributeType;
    attributeTitle: string;
}) {
    return (
        <div key={attributeKey} className="verifiable-credential__body-attributes-row">
            <label>{attributeTitle.toLowerCase()}</label>
            <div className="verifiable-credential__body-attributes-row-value">{attributeValue.toString()}</div>
        </div>
    );
}

type ClickableProps = ClassName & PropsWithChildren<{ onClick?: () => void; metadata: VerifiableCredentialMetadata }>;

/**
 * Wraps children components in a verifiable credential card that is clickable if onClick
 * is defined.
 */
function ClickableVerifiableCredential({ children, onClick, metadata, className }: ClickableProps) {
    if (onClick) {
        return (
            <div
                className={clsx('verifiable-credential verifiable-credential__clickable', className)}
                style={{ backgroundColor: metadata.backgroundColor }}
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
        <div className={clsx('verifiable-credential', className)} style={{ backgroundColor: metadata.backgroundColor }}>
            {children}
        </div>
    );
}

/**
 * Apply the schema and localization to an attribute, adding the title from the schema or localization, which
 * should be displayed to the user.
 * @param schema the schema to apply
 * @param localization the localization to apply
 * @returns the attribute together with its title.
 * @throws if there is a mismatch in fields between the credential and the schema, i.e. the schema is invalid.
 */
function applySchemaAndLocalization(
    schema: VerifiableCredentialSchema,
    localization?: Record<string, string>
): (value: [string, AttributeType]) => { title: string; key: string; value: AttributeType } {
    return (value: [string, AttributeType]) => {
        const attributeSchema = schema.properties.credentialSubject.properties.attributes.properties[value[0]];
        if (!attributeSchema) {
            throw new Error(`Missing attribute schema for key: ${value[0]}`);
        }
        let { title } = attributeSchema;

        if (localization) {
            const localizedTitle = localization[value[0]];
            if (localizedTitle !== undefined) {
                title = localizedTitle;
            } else {
                // TODO Throw an error if we are missing a localization attribute key when we have added
                // validation at the time of retrieving localization data.
                // throw new Error(`Missing localization for key: ${value[0]}`);
            }
        }

        return {
            title,
            key: value[0],
            value: value[1],
        };
    };
}

export function VerifiableCredentialCardHeader({
    metadata,
    credentialStatus,
}: {
    metadata: VerifiableCredentialMetadata;
    credentialStatus: VerifiableCredentialStatus;
}) {
    return (
        <header className="verifiable-credential__header">
            <Logo logo={metadata.logo} />
            <div className="verifiable-credential__header__title">{metadata.title}</div>
            <StatusIcon status={credentialStatus} />
        </header>
    );
}

interface CardProps extends ClassName {
    credentialSubject: Omit<CredentialSubject, 'id'>;
    schema: VerifiableCredentialSchema;
    credentialStatus: VerifiableCredentialStatus;
    metadata: VerifiableCredentialMetadata;
    onClick?: () => void;
    localization?: Record<string, string>;
}

export function VerifiableCredentialCard({
    credentialSubject,
    schema,
    onClick,
    credentialStatus,
    metadata,
    className,
    localization,
}: CardProps) {
    const attributes = Object.entries(credentialSubject.attributes).map(
        applySchemaAndLocalization(schema, localization)
    );

    return (
        <ClickableVerifiableCredential className={className} onClick={onClick} metadata={metadata}>
            <VerifiableCredentialCardHeader credentialStatus={credentialStatus} metadata={metadata} />
            {metadata.image && <DisplayImage image={metadata.image} />}
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
