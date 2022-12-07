/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AtomicStatement,
    EU_MEMBERS,
    MembershipStatement,
    MIN_DATE,
    NonMembershipStatement,
    RevealStatement,
    StatementTypes,
    getPastDate,
    MAX_DATE,
} from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import { formatAttributeValue } from 'wallet-common-helpers';
import countryTranslations from 'i18n-iso-countries';

import { useGetAttributeName } from '@popup/shared/utils/identity-helpers';
import { ConfirmedIdentity } from '@shared/storage/types';

export type SecretStatement = Exclude<AtomicStatement, RevealStatement>;

const isAgeStatement = (statement: SecretStatement): boolean => {
    if (statement.type !== StatementTypes.AttributeInRange) {
        return false;
    }

    const today = getPastDate(0);
    const isYearOffsetUpper = statement.upper.substring(4) === today.substring(4);
    const isYearOffsetLower = statement.lower.substring(4) === today.substring(4);

    if (statement.lower === MIN_DATE) {
        return isYearOffsetUpper;
    }
    if (statement.upper > today) {
        return isYearOffsetLower;
    }

    return isYearOffsetUpper && isYearOffsetLower;
};

export function useStatementHeader(statement: SecretStatement): string {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.headers' });

    switch (statement.attributeTag) {
        case 'countryOfResidence':
            return t('residence');
        case 'dob':
            return isAgeStatement(statement) ? t('age') : t('dob');
        case 'nationality':
            return t('nationality');
        case 'idDocIssuedAt':
        case 'idDocExpiresAt':
            return t('idValidity');
        case 'idDocIssuer':
            return t('idDocIssuer');
        case 'idDocType':
            return t('idDocType');
        default:
            throw new Error(`Unsupported attribute tag: ${statement.attributeTag}`);
    }
}

const getYearFromDateString = (ds: string): number => Number(ds.substring(0, 4));
const formatDateString = (ds: string): string => `${ds.substring(0, 4)}-${ds.substring(4, 6)}-${ds.substring(6)}`;

const isEuCountrySet = (countries: string[]) =>
    countries.length === EU_MEMBERS.length && countries.every((n) => EU_MEMBERS.includes(n));

const getTextForSet =
    <T extends (...args: any) => any>(t: T, statement: MembershipStatement | NonMembershipStatement) =>
    (inSet: Parameters<T>[0], notInSet: Parameters<T>[0], options?: Record<string, string>) =>
        t(statement.type === StatementTypes.AttributeInSet ? inSet : notInSet, options);

export function useStatementName(statement: SecretStatement): string {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.names' });
    const getAttributeName = useGetAttributeName();

    if (statement.type === StatementTypes.AttributeInRange) {
        switch (statement.attributeTag) {
            case 'dob':
                return isAgeStatement(statement) ? t('age') : t('dob');
            case 'idDocIssuedAt':
            case 'idDocExpiresAt':
                return t(statement.attributeTag);
        }
    } else {
        switch (statement.attributeTag) {
            case 'idDocIssuer':
            case 'idDocType':
            case 'countryOfResidence':
            case 'nationality':
                return t(statement.attributeTag);
        }
    }

    return getAttributeName(statement.attributeTag);
}

export function useStatementValue(statement: SecretStatement): string {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.proofs' });

    if (statement.type === StatementTypes.AttributeInRange) {
        switch (statement.attributeTag) {
            case 'dob': {
                const today = getPastDate(0);
                const upper = today < statement.upper ? today : statement.upper;
                const isAge = isAgeStatement(statement);

                if (isAge) {
                    const ageMin = getYearFromDateString(today) - getYearFromDateString(upper);
                    const ageMax = getYearFromDateString(today) - getYearFromDateString(statement.lower);

                    if (statement.lower === MIN_DATE) {
                        return t('ageMin', { age: ageMin });
                    }

                    if (statement.upper > today) {
                        return t('ageMax', { age: ageMax });
                    }

                    return t('ageBetween', { ageMin, ageMax });
                }

                const minDobString = formatDateString(statement.lower);
                const maxDobString = formatDateString(upper);

                if (statement.lower === MIN_DATE) {
                    return t('dateAfter', { dobString: maxDobString });
                }

                if (statement.upper > today) {
                    return t('dateBefore', { dobString: minDobString });
                }

                return t('dateBetween', { minDobString, maxDobString });
            }
            case 'idDocIssuedAt':
            case 'idDocExpiresAt': {
                const minDateString = formatDateString(statement.lower);
                const maxDateString = formatDateString(statement.upper);

                if (statement.lower === MIN_DATE) {
                    return t('dateAfter', { dateString: maxDateString });
                }

                if (statement.upper === MAX_DATE) {
                    return t('dateBefore', { dateString: minDateString });
                }

                return t('dateBetween', { minDateString, maxDateString });
            }
        }
    } else {
        const text = getTextForSet(t, statement as MembershipStatement);
        const n = statement.set.length.toString();

        switch (statement.attributeTag) {
            case 'nationality':
            case 'countryOfResidence':
                if (isEuCountrySet(statement.set)) {
                    return text('nationalityEU', 'nationalityNotEU');
                }

                return text('nationality', 'notNationality', {
                    n,
                });
            case 'idDocType':
                return text('docType', 'notDocType', { n });
            case 'idDocIssuer':
                return text('docIssuer', 'notDocIssuer', { n });
        }
    }

    return statement.attributeTag;
}

const isoToCountryName = (locale: string) => (isoCode: string) => countryTranslations.getName(isoCode, locale);

export function useStatementDescription(statement: SecretStatement, identity: ConfirmedIdentity): string | undefined {
    const { t, i18n } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.descriptions' });
    const hasAttribute = identity.idObject.value.attributeList.chosenAttributes[statement.attributeTag] !== undefined;

    if (!hasAttribute) {
        return t('missingAttribute', { identityName: identity.name });
    }

    if (statement.type === StatementTypes.AttributeInRange) {
        switch (statement.attributeTag) {
            case 'dob': {
                if (!isAgeStatement(statement)) {
                    return undefined;
                }

                const today = getPastDate(0);
                const minDateString = formatDateString(statement.lower);
                const maxDateString = formatDateString(statement.upper);

                if (statement.lower === MIN_DATE) {
                    return t('ageMin', { dateString: maxDateString });
                }
                if (statement.upper > today) {
                    return t('ageMax', { dateString: minDateString });
                }

                return t('ageBetween', { minDateString, maxDateString });
            }
        }
    } else {
        const text = getTextForSet(t, statement);
        const getCountryName = isoToCountryName(i18n.resolvedLanguage);

        switch (statement.attributeTag) {
            case 'countryOfResidence':
                if (isEuCountrySet(statement.set)) {
                    return text('residenceEU', 'residenceNotEU');
                }

                return text('residence', 'notResidence', {
                    countryNamesString: statement.set.map(getCountryName).join(', '),
                });
            case 'nationality':
                if (isEuCountrySet(statement.set)) {
                    return text('nationalityEU', 'nationalityNotEU');
                }

                return text('nationality', 'notNationality', {
                    countryNamesString: statement.set.map(getCountryName).join(', '),
                });
            case 'idDocIssuer':
                return text('docIssuer', 'notDocIssuer', {
                    issuerNamesString: statement.set.map(getCountryName).join(', '),
                });
            case 'idDocType':
                return text('docType', 'notDocType', {
                    typeNamesString: statement.set
                        .map((type) => formatAttributeValue(statement.attributeTag, type))
                        .join(', '),
                });
        }
    }

    return undefined;
}

export function canProveStatement(statement: SecretStatement, identity: ConfirmedIdentity) {
    const attribute = identity.idObject.value.attributeList.chosenAttributes[statement.attributeTag];

    switch (statement.type) {
        case StatementTypes.AttributeInSet:
            return statement.set.includes(attribute);
        case StatementTypes.AttributeNotInSet:
            return !statement.set.includes(attribute);
        case StatementTypes.AttributeInRange:
            return statement.upper > attribute && attribute >= statement.lower;
        default:
            throw new Error(`Statement type not supported in ${JSON.stringify(statement)}`);
    }
}