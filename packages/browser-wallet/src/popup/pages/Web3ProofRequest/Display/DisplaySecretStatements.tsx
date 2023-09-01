import { AttributeType, canProveAtomicStatement, StatementTypes } from '@concordium/web-sdk';
import { CredentialSchemaSubject } from '@shared/storage/types';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { DisplayStatementLine } from './DisplayStatementLine';
import { DisplayBox } from './DisplayBox';
import { SecretStatementV2 } from '../utils';
import { DisplayProps, getPropertyTitle } from './utils';

function getStatementValue<Attribute extends AttributeType>(
    statement: SecretStatementV2,
    schema: CredentialSchemaSubject,
    t: TFunction<'web3IdProofRequest', 'displayStatement'>,
    formatAttribute: (key: string, value: Attribute) => string
): string {
    const name = getPropertyTitle(statement.attributeTag, schema);
    if (statement.type === StatementTypes.AttributeInRange) {
        return t('proofs.range', {
            name,
            upper: formatAttribute(statement.attributeTag, statement.upper as Attribute),
            lower: formatAttribute(statement.attributeTag, statement.lower as Attribute),
        });
    }
    if (statement.type === StatementTypes.AttributeInSet) {
        return t('proofs.membership', { name });
    }
    if (statement.type === StatementTypes.AttributeNotInSet) {
        return t('proofs.nonMembership', { name });
    }

    throw new Error('Unknown statement type');
}

function getStatementDescription<Attribute extends AttributeType>(
    statement: SecretStatementV2,
    schema: CredentialSchemaSubject,
    t: TFunction<'web3IdProofRequest', 'displayStatement'>,
    formatAttribute: (key: string, value: Attribute) => string
) {
    const name = getPropertyTitle(statement.attributeTag, schema);
    const listToString = (list: AttributeType[]) =>
        list.map((member) => formatAttribute(statement.attributeTag, member as Attribute)).join(', ');

    switch (statement.type) {
        case StatementTypes.AttributeInRange:
            return t('descriptions.range', {
                name,
                upper: formatAttribute(statement.attributeTag, statement.upper as Attribute),
                lower: formatAttribute(statement.attributeTag, statement.lower as Attribute),
            });
        case StatementTypes.AttributeInSet:
            return t('descriptions.membership', { name, setNames: listToString(statement.set) });
        case StatementTypes.AttributeNotInSet:
            return t('descriptions.nonMembership', { name, setNames: listToString(statement.set) });
        default:
            throw new Error(`Unknown statement type encountered: ${statement.type}`);
    }
}

export function DisplaySecretStatements<Attribute extends AttributeType>({
    schema,
    statements,
    attributes,
    className,
    formatAttribute = (_, value) => value.toString(),
    overwriteSecretLine = () => ({}),
}: DisplayProps<SecretStatementV2, Attribute>) {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement' });
    const header = t('headers.secret');

    const lines = statements.map((s) => {
        const value = getStatementValue(s, schema, t, formatAttribute);
        const attribute = getPropertyTitle(s.attributeTag, schema);
        const description = getStatementDescription(s, schema, t, formatAttribute);

        return {
            value,
            attribute,
            description,
            ...overwriteSecretLine(s),
            isRequirementMet: canProveAtomicStatement(s, attributes),
        };
    });

    return (
        <DisplayBox
            className={className}
            header={header}
            infoBox={
                <>
                    <p className="display4">{t('secretTooltip.header')}</p>
                    <p className="bodyLightL">{t('secretTooltip.body')}</p>
                </>
            }
        >
            <ul className="display-secret-statements__body list-clear">
                {lines.map(({ description, ...l }, i) => (
                    <div className="display-secret-statements__line">
                        <DisplayStatementLine
                            className="m-b-5 heading6"
                            // eslint-disable-next-line react/no-array-index-key
                            key={i} // Allow this, as we don't expect these to ever change.
                            {...l}
                        />
                        <div className="display-secret-statements__description bodyXS">{description}</div>
                    </div>
                ))}
            </ul>
        </DisplayBox>
    );
}
