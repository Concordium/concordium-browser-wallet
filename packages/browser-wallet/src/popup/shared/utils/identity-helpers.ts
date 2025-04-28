import { identitiesAtomWithLoading } from '@popup/store/identity';
import { mapAsyncWrapper } from '@popup/store/utils';
import { ConfirmedIdentity, CreationStatus, Identity } from '@shared/storage/types';
import { useAtomValue } from 'jotai';
import { TFunction, useTranslation } from 'react-i18next';
import { formatDate } from 'wallet-common-helpers';
import { isoToCountryName } from '@popup/pages/IdProofRequest/DisplayStatement/utils';
import sharedTranslations from '../i18n/en';

export function useGetAttributeName() {
    const { t } = useTranslation('shared', { keyPrefix: 'idAttributes' });

    return (attributeKey: keyof typeof sharedTranslations.idAttributes) => {
        return attributeKey in sharedTranslations.idAttributes ? t(attributeKey) : attributeKey;
    };
}

enum Sex {
    NotKnown,
    Male,
    Female,
    NA = 9,
}

function formatGender(sex: Sex, t: TFunction<'shared', 'idAttributeValues'>) {
    switch (sex) {
        case Sex.NotKnown:
            return t('sex.NotKnown');
        case Sex.Male:
            return t('sex.Male');
        case Sex.Female:
            return t('sex.Female');
        case Sex.NA:
            return t('sex.NA');
        default:
            return t('sex.Unavailable');
    }
}

enum DocumentType {
    NA,
    Passport,
    NationalIdCard,
    DriversLicense,
    ImmigrationCard,
}

function formatDocumentType(value: string, t: TFunction<'shared', 'idAttributeValues'>) {
    const type = parseInt(value, 10);

    switch (type) {
        case DocumentType.NA:
            return t('documentType.NA');
        case DocumentType.NationalIdCard:
            return t('documentType.NationalIdCard');
        case DocumentType.Passport:
            return t('documentType.Passport');
        case DocumentType.DriversLicense:
            return t('documentType.DriversLicense');
        case DocumentType.ImmigrationCard:
            return t('documentType.ImmigrationCard');
        default:
            return value;
    }
}

export function useDisplayAttributeValue() {
    const { t, i18n } = useTranslation('shared', { keyPrefix: 'idAttributeValues' });

    return (key: string, value: string) => {
        switch (key) {
            case 'idDocExpiresAt':
            case 'idDocIssuedAt':
            case 'dob':
                return formatDate(value, i18n.resolvedLanguage);
            case 'sex':
                return formatGender(parseInt(value, 10), t);
            case 'idDocType':
                return formatDocumentType(value, t);
            case 'countryOfResidence':
            case 'nationality':
            case 'idDocIssuer':
                return isoToCountryName(i18n.resolvedLanguage)(value);
            default:
                return value;
        }
    };
}

export function isConfirmedIdentity(identity: Identity): identity is ConfirmedIdentity {
    return identity.status === CreationStatus.Confirmed;
}

export function useConfirmedIdentities() {
    const identities = useAtomValue(identitiesAtomWithLoading);
    return mapAsyncWrapper(identities, (ids) => ids.filter(isConfirmedIdentity));
}
