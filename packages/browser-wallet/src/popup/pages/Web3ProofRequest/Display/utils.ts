import { CredentialSchemaSubject } from '@shared/storage/types';
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
