/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AtomicStatement,
    EU_MEMBERS,
    MembershipStatement,
    NonMembershipStatement,
    RevealStatement,
    StatementTypes,
} from '@popup/shared/idProofTypes'; // TODO: get from SDK, remove file after
import { ConfirmedIdentity } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import { formatAttributeValue } from 'wallet-common-helpers';

export type SecretStatement = Exclude<AtomicStatement, RevealStatement>;

export function useStatementHeader(statement: SecretStatement): string {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.headers' });

    switch (statement.attributeTag) {
        case 'countryOfResidence':
            return t('residence');
        case 'dob':
            return t('age');
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

const isEuCountrySet = (countries: string[]) =>
    countries.length === EU_MEMBERS.length && countries.every((n) => EU_MEMBERS.includes(n));

const getTextForSet =
    <T extends (...args: any) => any>(t: T, statement: MembershipStatement | NonMembershipStatement) =>
    (inSet: Parameters<T>[0], notInSet: Parameters<T>[0], options?: Record<string, string>) =>
        t(statement.type === StatementTypes.AttributeInSet ? inSet : notInSet, options);

export function useStatementValue(statement: SecretStatement): string {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.proofs' });

    if (statement.type === StatementTypes.AttributeInRange) {
        switch (statement.attributeTag) {
            case 'dob':
                // TODO: support ageMin and ageMax
                return t('ageBetween');
        }
    } else {
        const text = getTextForSet(t, statement as MembershipStatement);

        switch (statement.attributeTag) {
            case 'nationality':
                if (isEuCountrySet(statement.set)) {
                    return text('nationalityEU', 'nationalityNotEU');
                }

                return text('nationality', 'notNationality', {
                    n: statement.set.length.toString(),
                });
        }
    }

    return statement.attributeTag;
}

export function useStatementDescription(statement: SecretStatement): string | undefined {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.descriptions' });

    if (statement.type === StatementTypes.AttributeInRange) {
        switch (statement.attributeTag) {
            case 'dob':
                // TODO: support ageMin and ageMax
                return t('ageBetween');
        }
    } else {
        const text = getTextForSet(t, statement);

        switch (statement.attributeTag) {
            // TODO: map set to readable values
            case 'countryOfResidence':
                return text('residence', 'notResidence', {
                    countryNamesString: statement.set.join(', '),
                });
            case 'nationality':
                if (isEuCountrySet(statement.set)) {
                    return text('nationalityEU', 'nationalityNotEU');
                }

                return text('nationality', 'notNationality', {
                    countryNamesString: statement.set.join(', '),
                });
            case 'idDocIssuer':
                return text('docIssuer', 'notDocIssuer', {
                    issuerNamesString: statement.set.join(', '),
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

export function canProoveStatement(statement: SecretStatement, identity: ConfirmedIdentity) {
    const attribute = identity.idObject.value.attributeList.chosenAttributes[statement.attributeTag];

    switch (statement.type) {
        case StatementTypes.AttributeInSet:
            return statement.set.includes(attribute);
        case StatementTypes.AttributeNotInSet:
            return !statement.set.includes(attribute);
        case StatementTypes.AttributeInRange:
            return statement.upper > attribute && attribute > statement.lower;
        default:
            throw new Error(`Statement type not supported in ${JSON.stringify(statement)}`);
    }
}
