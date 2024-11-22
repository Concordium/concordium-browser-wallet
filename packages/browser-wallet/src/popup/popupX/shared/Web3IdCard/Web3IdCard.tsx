import React from 'react';
import { ClassName } from 'wallet-common-helpers';
import { AttributeType } from '@concordium/web-sdk';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import { VerifiableCredential, VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';

import {
    defaultFormatAttribute,
    useCredentialLocalization,
    useCredentialMetadata,
    useCredentialSchema,
    useCredentialStatus,
} from '../utils/verifiable-credentials';
import Button from '../Button';

/**
 * Component for displaying the status of a verifiable credential.
 */
function Status({ status }: { status: VerifiableCredentialStatus }) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.web3IdCard.status' });

    let text = '';
    let className = '';
    switch (status) {
        case VerifiableCredentialStatus.Active:
            text = t('active');
            className = 'web3-id-card-x__status--success';
            break;
        case VerifiableCredentialStatus.Revoked:
            text = t('revoked');
            className = 'web3-id-card-x__status--success';
            break;
        case VerifiableCredentialStatus.Expired:
            text = t('expired');
            className = 'web3-id-card-x__status--success';
            break;
        case VerifiableCredentialStatus.NotActivated:
            text = t('notActivated');
            className = 'web3-id-card-x__status--success';
            break;
        case VerifiableCredentialStatus.Pending:
            text = t('pending');
            className = 'web3-id-card-x__status--success';
            break;
        default:
            break;
    }

    return <div className={clsx('web3-id-card-x__status', className)}>{text}</div>;
}

type AttributeView = { title: string; value: string };

type ViewProps = ClassName & {
    onClick?: () => void;
    attributes: AttributeView[];
    title: string;
    status: VerifiableCredentialStatus;
    warning?: string;
};

/**
 * Presentation component for {@linkcode Web3IdCard}, which should generally be used instead.
 */
export function Web3IdCardView({ onClick, status, title, attributes, className, warning }: ViewProps) {
    return (
        <Button.Base onClick={onClick}>
            <Card className={clsx('web3-id-card-x', className)}>
                <Card.Row>
                    <ConcordiumLogo />
                    <Text.MainMedium>{title}</Text.MainMedium>
                    <Status status={status} />
                </Card.Row>
                {warning !== undefined && <div>{warning}</div>} {/* FIXME: make this look right... */}
                {attributes.map((attr) => (
                    <Card.RowDetails title={attr.title} value={attr.value} />
                ))}
            </Card>
        </Button.Base>
    );
}

/**
 * Checks that the schema has an entry for each attribute.
 * @param schema the schema to validate against the attributes
 * @param attributes the attributes which keys should be in the schema
 * @returns true if all attribute keys are present in the schema, otherwise false
 */
function validateSchemaMatchesAttributes(
    schema: VerifiableCredentialSchema,
    attributes: Record<string, AttributeType>
) {
    for (const attributeKey of Object.keys(attributes)) {
        const schemaProperty = schema.properties.credentialSubject.properties.attributes.properties[attributeKey];
        if (!schemaProperty) {
            return false;
        }
    }
    return true;
}

/**
 * Apply the schema and localization to an attribute, adding the title from the schema or localization, which
 * should be displayed to the user.
 * If there is a missing key in the schema, then the attribute key is used as the title instead.
 * @param schema the schema to apply
 * @param localization the localization to apply
 * @returns the attribute together with its title.
 */
function applySchemaAndLocalization(
    schema: VerifiableCredentialSchema,
    localization?: Record<string, string>
): (value: [string, AttributeType]) => AttributeView {
    return (value: [string, AttributeType]) => {
        const attributeSchema = schema.properties.credentialSubject.properties.attributes.properties[value[0]];
        let title = attributeSchema ? attributeSchema.title : value[0];

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
            value: defaultFormatAttribute(value[1]),
        };
    };
}

type Props = Pick<ViewProps, 'onClick' | 'className'> & {
    credential: VerifiableCredential;
};

export default function Web3IdCard({ credential, ...viewProps }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.web3IdCard.warning' });
    const status = useCredentialStatus(credential);
    const schema = useCredentialSchema(credential);
    const metadata = useCredentialMetadata(credential);
    const localization = useCredentialLocalization(credential);

    // Render nothing until all the required data is available.
    if (!schema || !metadata || localization.loading || status === undefined) {
        return null;
    }

    const schemaMatchesCredentialAttributes = validateSchemaMatchesAttributes(
        schema,
        credential.credentialSubject.attributes
    );
    const attributes = Object.entries(credential.credentialSubject.attributes).map(
        applySchemaAndLocalization(schema, localization.result)
    );

    let warning: string | undefined;
    if (!schemaMatchesCredentialAttributes) {
        warning = t('schemaMismatch');
    } else if (schema.usingFallback) {
        warning = t('fallback');
    }

    return (
        <Web3IdCardView
            attributes={attributes}
            title={metadata.title}
            status={status}
            warning={warning}
            {...viewProps}
        />
    );
}
