import Button from '@popup/shared/Button';
import Modal from '@popup/shared/Modal';
import clsx from 'clsx';
import React, { ReactNode, useState } from 'react';
import { ClassName } from 'wallet-common-helpers';
import InfoTooltipIcon from '@assets/svg/info-tooltip.svg';
import { AttributeType, RevealStatementV2, StatementTypes } from '@concordium/web-sdk';
import { Trans, useTranslation } from 'react-i18next';
import { getPropertyTitle } from './VerifiableCredentialStatement';
import { VerifiableCredentialSchema } from '@shared/storage/types';
import { DisplayStatementLine } from '../IdProofRequest/DisplayStatement/DisplayStatement';
import { SecretStatementV2 } from './utils';
import { useStatementValue } from '../IdProofRequest/DisplayStatement/utils';
import { TFunction } from 'react-i18next';

type DisplayBoxProps = ClassName & {
    header: string;
    children: ReactNode;
    infoBox: ReactNode;
}

export function DisplayBox ({ className, children, header, infoBox }: DisplayBoxProps) {
    const [open, setOpen] = useState(false);

    return (
        <section className={clsx('display-box', className)}>
            <header className="display-box__header">
                        <div>
                            <strong>{header}</strong>
            </div>
        <Modal
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            trigger={
                <Button clear className="flex">
                    <InfoTooltipIcon className="display-box__tooltip-icon" />
                </Button>
            }
            >
            {infoBox}
        </Modal>
            </header>
            {children}
        </section>
    );
}

type RevealProps = ClassName & {
    dappName: string;
    statements: RevealStatementV2[];
    attributes: Record<string, AttributeType>;
    schema: VerifiableCredentialSchema;
    className: string;
}

export function DisplayRevealStatements({ className, statements, attributes, dappName, schema}: RevealProps) {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement' });
    const header = t('headers.reveal');

    const lines = statements.map((s) => {
        const value = attributes[s.attributeTag];
        const title = getPropertyTitle(s.attributeTag, schema);
        return {
            attribute: title,
            value: value.toString() ?? 'Unavailable',
            isRequirementMet: value !== undefined,
        };
    });

    return (
        <DisplayBox className={className} header={header} infoBox={(<></>)}>
             <ul className="list-clear p-15 m-0">
            {lines.map((l, i) => (
                <DisplayStatementLine
                className="display-reveal-statements__line"
                // eslint-disable-next-line react/no-array-index-key
                key={i} // Allow this, as we don't expect these to ever change.
                {...l}
                    />
            ))}
        </ul>
            <div className="display-statement__description">
                    <Trans
                    ns="idProofRequest"
                    i18nKey="displayStatement.revealDescription"
                    components={{ 1: <strong /> }}
                    values={{ dappName }}
                        />
            </div>
            </DisplayBox>
    )
}

type SecretProps = ClassName & {
    dappName: string;
    statements: SecretStatementV2[];
    attributes: Record<string, AttributeType>;
    schema: VerifiableCredentialSchema;
    className: string;
}

function getStatementValue(statement: SecretStatementV2, schema: VerifiableCredentialSchema, t: TFunction<'web3IdProofRequest', 'displayStatement.proofs'>): string {
    const name = getPropertyTitle(statement.attributeTag, schema);
    if (statement.type === StatementTypes.AttributeInRange) {
        return t('range', { name, upper: statement.upper, lower: statement.lower });
    }
    if (statement.type === StatementTypes.AttributeInSet) {
        return t('membership', { name });
    }
    if (statement.type === StatementTypes.AttributeNotInSet) {
        return t('nonMembership', { name });
    }

    throw new Error('Unknown statement type');
}

export function getStatementDescription(statement: SecretStatementV2, schema: VerifiableCredentialSchema, t: TFunction<'web3IdProofRequest', 'displayStatement.descriptions'>) {
    const name = getPropertyTitle(statement.attributeTag, schema);
    const listToString = (list: AttributeType[]) => list.map((member) => member.toString()).join(', ');

    switch (statement.type) {
        case StatementTypes.AttributeInRange:
            return t('range', { name, lower: statement.lower, upper: statement.upper });
        case StatementTypes.AttributeInSet:
            return t('membership', { name, setNames: listToString(statement.set) });
        case StatementTypes.AttributeNotInSet:
            return t('nonMembership', { name, setNames: listToString(statement.set) });
        default:
            throw new Error(`Unknown statement type encountered: ${statement.type}`);
    }
}

export function DisplaySecretStatements({ schema, statements, className, dappName  }: SecretProps) {
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
            description
        };
    });

    return (
        <DisplayBox className={className} header={header} infoBox={(<></>)}>
             <ul className="list-clear p-5 m-0">
            {lines.map((l, i) => (
                <DisplayStatementLine
                className="display-reveal-statements__line"
                // eslint-disable-next-line react/no-array-index-key
                key={i} // Allow this, as we don't expect these to ever change.
                {...l}
                    />
            ))}
        </ul>
       </DisplayBox>
    )

}
