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
import countryTranslations from 'i18n-iso-countries';

import { useDisplayAttributeValue, useGetAttributeName } from '@popup/shared/utils/identity-helpers';
import { ConfirmedIdentity } from '@shared/storage/types';

export type SecretStatement = Exclude<AtomicStatement, RevealStatement>;

const getYearFromDateString = (ds: string): number => Number(ds.substring(0, 4));
const formatDateString = (ds: string): string => `${ds.substring(0, 4)}-${ds.substring(4, 6)}-${ds.substring(6)}`;

const isEuCountrySet = (countries: string[]) =>
    countries.length === EU_MEMBERS.length && countries.every((n) => EU_MEMBERS.includes(n));

const getTextForSet =
    <T extends (...args: any) => any>(t: T, statement: MembershipStatement | NonMembershipStatement) =>
    (inSet: Parameters<T>[0], notInSet: Parameters<T>[0], options?: Record<string, string>) =>
        t(statement.type === StatementTypes.AttributeInSet ? inSet : notInSet, options);

/**
 * Turns a YYYYMMDD string into a date object
 */
function dateStringToDate(date: string): Date {
    return new Date(Date.parse(formatDateString(date)));
}

/**
 * Turns a date object into a YYYYMMDD string
 */
function dateToDateString(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return year + month + day;
}

/**
 * Given YYYYMMDD return YYYYMMDD + x day(s).
 */
function addDays(date: string, days: number): string {
    const d = dateStringToDate(date);
    d.setDate(d.getDate() + days);
    return dateToDateString(d);
}

const isAgeStatement = (statement: SecretStatement): boolean => {
    if (statement.type !== StatementTypes.AttributeInRange) {
        return false;
    }

    const today = getPastDate(0);
    const isYearOffsetUpper = addDays(statement.upper, -1).substring(4) === today.substring(4);
    const isYearOffsetLower = addDays(statement.lower, -1).substring(4) === today.substring(4);

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

                if (isAgeStatement(statement)) {
                    const ageMin = getYearFromDateString(today) - getYearFromDateString(addDays(statement.upper, -1));
                    const ageMax =
                        getYearFromDateString(today) - getYearFromDateString(addDays(statement.lower, -1)) - 1;

                    if (statement.lower === MIN_DATE) {
                        return t('ageMin', { age: ageMin });
                    }

                    if (statement.upper > today) {
                        return t('ageMax', { age: ageMax });
                    }

                    if (ageMin === ageMax) {
                        return t('ageExact', { age: ageMin });
                    }

                    return t('ageBetween', { ageMin, ageMax });
                }

                const minDateString = formatDateString(statement.lower);
                const maxDateString = formatDateString(upper);

                if (statement.lower === MIN_DATE) {
                    return t('dateBefore', { dateString: maxDateString });
                }

                if (statement.upper > today) {
                    return t('dateAfterIncl', { dateString: minDateString });
                }

                return t('dateBetween', { minDateString, maxDateString });
            }
            case 'idDocIssuedAt':
            case 'idDocExpiresAt': {
                const minDateString = formatDateString(statement.lower);
                const maxDateString = formatDateString(statement.upper);

                if (statement.lower === MIN_DATE) {
                    return t('dateBefore', { dateString: maxDateString });
                }

                if (statement.upper === MAX_DATE) {
                    return t('dateAfterIncl', { dateString: minDateString });
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

export const isoToCountryName = (locale: string) => (isoCode: string) => countryTranslations.getName(isoCode, locale);

export function useStatementDescription(statement: SecretStatement, identity: ConfirmedIdentity): string | undefined {
    const { t, i18n } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.descriptions' });
    const displayAttribute = useDisplayAttributeValue();
    const hasAttribute = identity.idObject.value.attributeList.chosenAttributes[statement.attributeTag] !== undefined;

    if (!hasAttribute) {
        return t('missingAttribute', { identityName: identity.name });
    }

    if (statement.type === StatementTypes.AttributeInRange) {
        switch (statement.attributeTag) {
            case 'dob':
            case 'idDocIssuedAt':
            case 'idDocExpiresAt': {
                const minDateString = formatDateString(statement.lower);
                const maxDateString = formatDateString(statement.upper);

                return t(statement.attributeTag, { minDateString, maxDateString });
            }
        }
    } else {
        const text = getTextForSet(t, statement);
        const getCountryName = isoToCountryName(i18n.resolvedLanguage);

        switch (statement.attributeTag) {
            case 'countryOfResidence':
                return text('residence', 'notResidence', {
                    countryNamesString: statement.set.map(getCountryName).join(', '),
                });
            case 'nationality':
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
                        .map((type) => displayAttribute(statement.attributeTag, type))
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
