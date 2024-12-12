import { AttributeType, CredentialSchemaSubject, isTimestampAttribute } from '@concordium/web-sdk';
import { withDateAndTime } from '@shared/utils/time-helpers';
import { ClassName } from 'wallet-common-helpers';
import { SecretStatementV2 } from '../utils';

export function getPropertyTitle(attributeTag: string, schemaSubject: CredentialSchemaSubject) {
    // TODO use localization here
    const property = schemaSubject.properties.attributes.properties[attributeTag];
    return property ? property.title : attributeTag;
}

export type OverwriteSecretLine = (statement: SecretStatementV2) => {
    attribute?: string;
    value?: string;
    description?: string;
};

export type DisplayProps<StatementType, Attribute> = ClassName & {
    statements: StatementType[];
    attributes: Record<string, Attribute>;
    schema: CredentialSchemaSubject;
    className: string;
    formatAttribute?: (key: string, value: Attribute) => string;
    overwriteSecretLine?: OverwriteSecretLine;
};

export function defaultFormatAttribute<Attribute extends AttributeType>(_: string, value: Attribute) {
    return value !== undefined && isTimestampAttribute(value)
        ? withDateAndTime(Date.parse(value.timestamp))
        : value?.toString();
}
