import { AttributeType, StatementTypes } from '@concordium/web-sdk';
import { DisplayStatementLine } from '@popup/pages/IdProofRequest/DisplayStatement/DisplayStatement';
import { VerifiableCredentialSchema } from '@shared/storage/types';
import React from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';
import { DisplayBox } from './DisplayBox';
import { SecretStatementV2 } from '../utils';
import { getPropertyTitle } from './utils';

type SecretProps = ClassName & {
    statements: SecretStatementV2[];
    attributes: Record<string, AttributeType>;
    schema: VerifiableCredentialSchema;
    className: string;
};

function getStatementValue(
    statement: SecretStatementV2,
    schema: VerifiableCredentialSchema,
    t: TFunction<'web3IdProofRequest', 'displayStatement'>
): string {
    const name = getPropertyTitle(statement.attributeTag, schema);
    if (statement.type === StatementTypes.AttributeInRange) {
        return t('proofs.range', { name, upper: statement.upper, lower: statement.lower });
    }
    if (statement.type === StatementTypes.AttributeInSet) {
        return t('proofs.membership', { name });
    }
    if (statement.type === StatementTypes.AttributeNotInSet) {
        return t('proofs.nonMembership', { name });
    }

    throw new Error('Unknown statement type');
}

function getStatementDescription(
    statement: SecretStatementV2,
    schema: VerifiableCredentialSchema,
    t: TFunction<'web3IdProofRequest', 'displayStatement'>
) {
    const name = getPropertyTitle(statement.attributeTag, schema);
    const listToString = (list: AttributeType[]) => list.map((member) => member.toString()).join(', ');

    switch (statement.type) {
        case StatementTypes.AttributeInRange:
            return t('descriptions.range', { name, lower: statement.lower, upper: statement.upper });
        case StatementTypes.AttributeInSet:
            return t('descriptions.membership', { name, setNames: listToString(statement.set) });
        case StatementTypes.AttributeNotInSet:
            return t('descriptions.nonMembership', { name, setNames: listToString(statement.set) });
        default:
            throw new Error(`Unknown statement type encountered: ${statement.type}`);
    }
}

export function DisplaySecretStatements({ schema, statements, className }: SecretProps) {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement' });
    const header = t('headers.secret');

    const lines = statements.map((s) => {
        const value = getStatementValue(s, schema, t);
        const title = getPropertyTitle(s.attributeTag, schema);
        const description = getStatementDescription(s, schema, t);
        return {
            attribute: title,
            value: value.toString() ?? 'Unavailable',
            isRequirementMet: value !== undefined,
            description,
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
            <ul className="list-clear p-5 m-0">
                {lines.map(({ description, ...l }, i) => (
                    <div className="display-secret-statements__line">
                        <DisplayStatementLine
                            className="m-b-5 heading6"
                            // eslint-disable-next-line react/no-array-index-key
                            key={i} // Allow this, as we don't expect these to ever change.
                            {...l}
                        />
                        <div className="display-statement__description">{description}</div>
                    </div>
                ))}
            </ul>
        </DisplayBox>
    );
}
