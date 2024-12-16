import { AttributeType, canProveAtomicStatement, CredentialSchemaSubject, StatementTypes } from '@concordium/web-sdk';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import clsx from 'clsx';

import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import InfoIcon from '@assets/svgX/info.svg';

import { DisplayStatementLine } from './DisplayStatementLine';
import { SecretStatementV2 } from '../utils';
import { DisplayProps, defaultFormatAttribute, getPropertyTitle } from './utils';
import DisplayStatementsTooltip from './DisplayStatementsTooltip';

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
    overwriteSecretLine = () => ({}),
    formatAttribute = defaultFormatAttribute,
}: DisplayProps<SecretStatementV2, Attribute>) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.verifiablePresentationRequest.displayStatement' });

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
        <Card className={clsx(className, 'display-statement-x')} type="grey">
            <Card.Row className="display-statement-x__header">
                <Text.CaptureAdditional>{t('headers.secret')}</Text.CaptureAdditional>
                <DisplayStatementsTooltip>
                    <Text.MainMedium>{t('secretTooltip.header')}</Text.MainMedium>
                    <Text.Capture className="block m-t-5">{t('secretTooltip.body')}</Text.Capture>
                </DisplayStatementsTooltip>
            </Card.Row>
            {lines.map(({ description, ...l }, i) => (
                <Card.Row className="display-statement-x__row">
                    <Text.CaptureAdditional>
                        <DisplayStatementLine
                            // eslint-disable-next-line react/no-array-index-key
                            key={i} // Allow this, as we don't expect these to ever change.
                            {...l}
                        />
                    </Text.CaptureAdditional>
                    <Text.Capture className="m-t-5 block">{description}</Text.Capture>
                </Card.Row>
            ))}
        </Card>
    );
}
