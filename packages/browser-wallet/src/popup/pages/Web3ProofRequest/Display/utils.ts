import { VerifiableCredentialSchema } from '@shared/storage/types';

export function getPropertyTitle(attributeTag: string, schema: VerifiableCredentialSchema) {
    // TODO use localization here
    const property = schema.properties.credentialSubject.properties.attributes.properties[attributeTag];
    return property ? property.title : attributeTag;
}
