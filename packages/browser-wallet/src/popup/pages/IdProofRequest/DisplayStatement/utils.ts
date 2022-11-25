import { AtomicStatement, RevealStatement, StatementTypes } from '@popup/shared/idProofTypes'; // TODO: get from SDK, remove file after
import { ConfirmedIdentity } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';

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

export function useStatementValue(statement: SecretStatement): string {
    return statement.attributeTag;
}

export function useStatementDescription(statement: SecretStatement): string | undefined {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement.descriptions' });

    if (statement.type === StatementTypes.AttributeInRange) {
        switch (statement.attributeTag) {
            case 'dob':
                // TODO: support ageMin and ageMax
                return t('ageBetween');
            default:
                return undefined;
        }
    }

    const getTextForSet = <S extends Parameters<typeof t>[0]>(
        inSet: S,
        notInSet: S,
        options?: Record<string, string>
    ) => t(statement.type === StatementTypes.AttributeInSet ? inSet : notInSet, options);

    switch (statement.attributeTag) {
        // TODO: map set to readable values
        case 'countryOfResidence':
            return getTextForSet('residence', 'notResidence', {
                countryNamesString: statement.set.join(', '),
            });
        case 'nationality':
            // TODO: support EU/notEU
            return getTextForSet('nationality', 'notNationality', {
                countryNamesString: statement.set.join(', '),
            });
        case 'idDocIssuer':
            return getTextForSet('docIssuer', 'notDocIssuer', {
                issuerNamesString: statement.set.join(', '),
            });
        case 'idDocType':
            return getTextForSet('docType', 'notDocType', {
                typeNamesString: statement.set.join(', '),
            });
        default:
            return undefined;
    }
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
