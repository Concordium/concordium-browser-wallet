import React from 'react';
import { ClassName, TimeStampUnit, dateFromTimestamp } from 'wallet-common-helpers';
import { AttributeType } from '@concordium/web-sdk';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import {
    MetadataUrl,
    VerifiableCredential,
    VerifiableCredentialSchema,
    VerifiableCredentialStatus,
} from '@shared/storage/types';
import {
    VerifiableCredentialMetadata,
    VerifiableCredentialSchemaWithFallback,
    parseCredentialDID,
} from '@shared/utils/verifiable-credential-helpers';
import Img from '@popup/shared/Img';

import { withDateAndTime } from '@shared/utils/time-helpers';
import {
    defaultFormatAttribute,
    useCredentialEntry,
    useCredentialLocalization,
    useCredentialMetadata,
    useCredentialSchema,
    useCredentialStatus,
} from '../utils/verifiable-credentials';

/**
 * Component for displaying the status of a verifiable credential.
 */
function Status({ status }: { status: VerifiableCredentialStatus }) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.web3IdCard.status' });

    let text = '';
    let className: string | undefined;
    switch (status) {
        case VerifiableCredentialStatus.Active:
            text = t('active');
            className = 'web3-id-card-x__status--success';
            break;
        case VerifiableCredentialStatus.Revoked:
            text = t('revoked');
            className = 'web3-id-card-x__status--error';
            break;
        case VerifiableCredentialStatus.Expired:
            text = t('expired');
            className = 'web3-id-card-x__status--error';
            break;
        case VerifiableCredentialStatus.NotActivated:
            text = t('notActivated');
            break;
        case VerifiableCredentialStatus.Pending:
            text = t('pending');
            break;
        default:
            break;
    }

    return <div className={clsx('web3-id-card-x__status', className)}>{text}</div>;
}

type AttributeView = { title: string; value: string };

type ViewProps = ClassName & {
    attributes: AttributeView[];
    title: string;
    status: VerifiableCredentialStatus;
    warning?: string;
    logo?: MetadataUrl;
};

/**
 * Presentation component for {@linkcode Web3IdCard}, which should generally be used instead.
 *
 * @param status - The status of the verifiable credential.
 * @param title - The title of the verifiable credential.
 * @param attributes - The attributes of the verifiable credential.
 * @param className - Additional class names for styling.
 * @param warning - Optional warning message to display.
 * @param logo - Optional logo to display.
 */
export function Web3IdCardView({ status, title, attributes, className, warning, logo }: ViewProps) {
    return (
        <Card className={clsx('web3-id-card-x', className)}>
            <Card.Row>
                <div className="web3-id-card-x__top">
                    <div className="flex align-center justify-space-between">
                        <div className="flex align-center">
                            {logo !== undefined ? <Img src={logo.url} /> : <ConcordiumLogo />}
                            <Text.MainMedium>{title}</Text.MainMedium>
                        </div>
                        <Status status={status} />
                    </div>
                    {warning !== undefined && <Text.Capture>{warning}</Text.Capture>}{' '}
                </div>
            </Card.Row>
            {attributes.map((attr) => (
                <Card.RowDetails key={attr.title} title={attr.title} value={attr.value} />
            ))}
        </Card>
    );
}

/**
 * Checks that the schema has an entry for each attribute.
 *
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
 *
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

type RawProps = Pick<ViewProps, 'className'> & {
    attributes: Record<string, AttributeType>;
    attributeOverrides?: AttributeView[];
    localization?: Record<string, string>;
    metadata: VerifiableCredentialMetadata;
    schema: VerifiableCredentialSchemaWithFallback;
    status: VerifiableCredentialStatus;
};

/**
 * Component for displaying a verifiable credential, supplying the necessary schema, localization, and credential metadata.
 *
 * @param schema - The schema of the verifiable credential.
 * @param localization - The localization data for the verifiable credential.
 * @param metadata - The metadata of the verifiable credential.
 * @param attributes - The attributes of the verifiable credential.
 * @param attributeOverrides - Optional attribute overrides.
 * @param status - The status of the verifiable credential.
 * @param viewProps - Additional view properties.
 */
export function Web3IdCardRaw({
    schema,
    localization,
    metadata,
    attributes,
    attributeOverrides,
    status,
    ...viewProps
}: RawProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.web3IdCard' });

    const schemaMatchesCredentialAttributes = validateSchemaMatchesAttributes(schema, attributes);
    const mappedAttributes =
        attributeOverrides ?? Object.entries(attributes).map(applySchemaAndLocalization(schema, localization));

    let warning: string | undefined;
    if (!schemaMatchesCredentialAttributes) {
        warning = t('warning.schemaMismatch');
    } else if (schema.usingFallback) {
        warning = t('warning.fallback');
    }

    return (
        <Web3IdCardView
            attributes={mappedAttributes}
            title={metadata.title}
            status={status}
            warning={warning}
            logo={metadata.logo}
            {...viewProps}
        />
    );
}

type Props = Pick<ViewProps, 'className'> & {
    credential: VerifiableCredential;
    showInfo?: boolean;
};

/**
 * Component for displaying a verifiable credential, where the additional credential data is retrieved from storage.
 *
 * @param credential - The verifiable credential to display.
 * @param showInfo - Flag to indicate whether to show additional information.
 * @param viewProps - Additional view properties.
 */
export default function Web3IdCard({ credential, showInfo = false, ...viewProps }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.web3IdCard' });
    const status = useCredentialStatus(credential);
    const schema = useCredentialSchema(credential);
    const metadata = useCredentialMetadata(credential);
    const localization = useCredentialLocalization(credential);
    const entry = useCredentialEntry(credential);

    // Render nothing until all the required data is available.
    if (!schema || !metadata || localization.loading || status === undefined) {
        return null;
    }

    let attributes: AttributeView[] | undefined;
    if (showInfo && entry !== undefined) {
        const [contract, id] = parseCredentialDID(credential.id);
        if (!entry) {
            return null;
        }

        const validFrom = dateFromTimestamp(entry.credentialInfo.validFrom, TimeStampUnit.milliSeconds);
        const validFromFormatted = withDateAndTime(validFrom);
        attributes = [
            { title: t('details.id'), value: id },
            { title: t('details.contract'), value: contract.toString() },
            { title: t('details.validFrom'), value: validFromFormatted },
        ];

        if (entry.credentialInfo.validUntil !== undefined) {
            const validUntil = dateFromTimestamp(entry.credentialInfo.validUntil, TimeStampUnit.milliSeconds);
            const validUntilFormatted = withDateAndTime(validUntil);
            attributes.push({ title: t('details.validUntil'), value: validUntilFormatted });
        }
    }

    return (
        <Web3IdCardRaw
            attributes={credential.credentialSubject.attributes}
            attributeOverrides={attributes}
            status={status}
            schema={schema}
            localization={localization.result}
            metadata={metadata}
            {...viewProps}
        />
    );
}
