import clsx from 'clsx';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ClassName, formatAttributeValue } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';
import { RevealStatement } from '@popup/shared/idProofTypes'; // TODO: get from SDK, remove file after

import SecretIcon from '@assets/svg/id-secret.svg';
import RevealIcon from '@assets/svg/id-reveal.svg';
import InfoTooltipIcon from '@assets/svg/info-tooltip.svg';
import WarningTooltipIcon from '@assets/svg/warning-tooltip.svg';
import CheckmarkIcon from '@assets/svg/checkmark-dark-green.svg';
import CrossIcon from '@assets/svg/cross.svg';

import Button from '@popup/shared/Button';
import Modal from '@popup/shared/Modal';
import { identityByAddressAtomFamily } from '@popup/store/identity';
import sharedTranslations from '@popup/shared/i18n/en';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { SecretStatement, useStatementDescription, useStatementHeader } from './utils';

type StatementLine = {
    attribute: string;
    value: string;
    isRequirementMet: boolean;
};

type StatementLineProps = StatementLine;

function DisplayStatementLine({ attribute, value, isRequirementMet }: StatementLineProps) {
    return (
        <li className="display-statement__line">
            <div className="display-statement__line-attribute">{attribute}:</div>
            <div className="display-statement__line-separator" />
            <div className="display-statement__line-value">
                {value}
                {isRequirementMet ? (
                    <CheckmarkIcon className="display-statement__line-check" />
                ) : (
                    <CrossIcon className="display-statement__line-cross" />
                )}
            </div>
        </li>
    );
}

type StatementTooltipProps = {
    reveal?: boolean;
};

function StatementTooltip({ reveal }: StatementTooltipProps) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement' });
    const body = reveal ? t('revealTooltip.body') : t('secretTooltip.body');
    const header = reveal ? (
        <Trans
            ns="idProofRequest"
            i18nKey="displayStatement.revealTooltip.header"
            components={{ 1: <WarningTooltipIcon className="display-statement__tooltip-icon" /> }}
        />
    ) : (
        t('secretTooltip.header')
    );

    return (
        <Modal
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            trigger={
                <Button clear className="flex">
                    {reveal ? (
                        <WarningTooltipIcon className="display-statement__tooltip-icon" />
                    ) : (
                        <InfoTooltipIcon className="display-statement__tooltip-icon" />
                    )}
                </Button>
            }
        >
            <h3>{header}</h3>
            <div className="white-space-break">{body}</div>
        </Modal>
    );
}

type BaseViewProps = ClassName & {
    header: string;
    lines: StatementLine[];
    dappName: string;
};

type RevealViewProps = BaseViewProps & {
    reveal: true;
};

type SecretViewProps = BaseViewProps & {
    reveal?: false;
    description?: string;
};

type ViewProps = RevealViewProps | SecretViewProps;

export function DisplayStatementView({ className, lines, dappName, header, ...props }: ViewProps) {
    const isValid = lines.every((l) => l.isRequirementMet);
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement' });

    return (
        <section className={clsx('display-statement', !isValid && 'display-statement--invalid', className)}>
            <header className="display-statement__header">
                <div className="flex align-center">
                    {props.reveal ? (
                        <RevealIcon className="display-statement__header-icon" />
                    ) : (
                        <SecretIcon className="display-statement__header-icon" />
                    )}
                    <div className="m-l-5">
                        <div>
                            <strong>{header}</strong>
                        </div>
                        <div className="flex align-center">
                            {isValid ? (
                                <>
                                    {t('requirementsMet')}{' '}
                                    <CheckmarkIcon className="display-statement__requirements-icon" />
                                </>
                            ) : (
                                <>
                                    {t('requirementsNotMet')}{' '}
                                    <CrossIcon className="display-statement__requirements-icon" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <StatementTooltip reveal={props.reveal} />
            </header>
            <ul className="list-clear p-5 m-0">
                {lines.map((l) => (
                    <DisplayStatementLine {...l} />
                ))}
            </ul>
            {(props.reveal || props.description) && (
                <div className="display-statement__description">
                    {props.reveal ? (
                        <Trans
                            ns="idProofRequest"
                            i18nKey="displayStatement.revealDescription"
                            components={{ 1: <strong /> }}
                            values={{ dappName }}
                        />
                    ) : (
                        props.description
                    )}
                </div>
            )}
        </section>
    );
}

type DisplayRevealStatementProps = {
    dappName: string;
    account: string;
    statements: RevealStatement[];
};

function DisplayRevealStatement({ dappName, statements, account }: DisplayRevealStatementProps) {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement' });
    const { t: sharedT } = useTranslation('shared', { keyPrefix: 'idAttributes' });
    const identity = ensureDefined(useAtomValue(identityByAddressAtomFamily(account)), 'Expected identity to be found');
    const attributes = identity?.idObject.value.attributeList.chosenAttributes;
    const header = t('headers.reveal');

    const lines: StatementLine[] = statements.map((s) => {
        const attribute = s.attributeTag in sharedTranslations.idAttributes ? sharedT(s.attributeTag) : s.attributeTag;
        const value = formatAttributeValue(s.attributeTag, attributes[s.attributeTag]);

        return {
            attribute,
            value,
            isRequirementMet: value !== undefined,
        };
    });

    return <DisplayStatementView reveal lines={lines} dappName={dappName} header={header} />;
}

type DisplaySecretStatementProps = {
    dappName: string;
    statement: SecretStatement;
};

function DisplaySecretStatement({ dappName, statement }: DisplaySecretStatementProps) {
    const header = useStatementHeader(statement);
    const description = useStatementDescription(statement);
    const lines: StatementLine[] = [
        {
            attribute: statement.attributeTag,
            value: 'value', // TODO: depending on attribute type
            isRequirementMet: true, // TODO local match on identity
        },
    ];

    return <DisplayStatementView lines={lines} dappName={dappName} header={header} description={description} />;
}

type Props = {
    dappName: string;
    account: string;
    statement: SecretStatement | RevealStatement[]; // Aggregate reveal statements into one view.
};

export default function DisplayStatement({ statement, dappName, account }: Props) {
    const reveal = Array.isArray(statement);

    if (reveal) {
        return <DisplayRevealStatement dappName={dappName} statements={statement} account={account} />;
    }

    return <DisplaySecretStatement dappName={dappName} statement={statement} />;
}
