import { AttributeType, CredentialSchemaSubject } from '@concordium/web-sdk';
import { withDateAndTime } from '@shared/utils/time-helpers';
import { ClassName } from 'wallet-common-helpers';

export function getPropertyTitle(attributeTag: string, schemaSubject: CredentialSchemaSubject) {
    // TODO use localization here
    const property = schemaSubject.properties.attributes.properties[attributeTag];
    return property ? property.title : attributeTag;
}

export type DisplayProps<StatementType, Attribute> = ClassName & {
    statements: StatementType[];
    attributes: Record<string, Attribute>;
    schema: CredentialSchemaSubject;
    className: string;
    formatAttribute?: (key: string, value: Attribute) => string;
};

export function defaultFormatAttribute<Attribute extends AttributeType>(_: string, value: Attribute) {
    return value instanceof Date ? withDateAndTime(value) : value?.toString();
}
