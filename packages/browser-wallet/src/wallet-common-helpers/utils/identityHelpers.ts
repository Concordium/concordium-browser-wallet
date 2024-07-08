import { AttributesKeys, AttributeKey } from '@concordium/web-sdk/types';

export const attributeNamesMap: {
    [P in AttributeKey]: string;
} = {
    countryOfResidence: 'Country of residence',
    firstName: 'First name',
    idDocExpiresAt: 'ID valid to',
    idDocIssuedAt: 'ID valid from',
    idDocIssuer: ' Identity document issuer',
    idDocType: 'Identity document type',
    idDocNo: ' Identity document number',
    lastName: 'Last name',
    taxIdNo: 'Tax ID number',
    nationalIdNo: 'National ID number',
    nationality: 'Country of nationality',
    sex: 'Sex',
    dob: 'Date of birth',
};

/**
 * Compare two attribute key names.
 * Tags, that are not in AttributeKey, are considered larger than those in AttributeKey.
 * This is to ensure that in a sorted ascending list, unknown attributes are placed at the end of the list.
 */
export function compareAttributes(attributeTag1: AttributeKey | string, attributeTag2: AttributeKey | string) {
    const attr1 = AttributesKeys[attributeTag1 as AttributeKey];
    const attr2 = AttributesKeys[attributeTag2 as AttributeKey];
    if (attr1 === undefined && attr2 === undefined) {
        return attributeTag1.localeCompare(attributeTag2);
    }
    if (attr1 === undefined) {
        return 1;
    }
    if (attr2 === undefined) {
        return -1;
    }
    return attr1 - attr2;
}
