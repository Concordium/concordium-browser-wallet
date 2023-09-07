/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';
import { RevealStatement, AttributeList } from '@concordium/web-sdk';

import SecretIcon from '@assets/svg/id-secret.svg';
import RevealIcon from '@assets/svg/id-reveal.svg';
import InfoTooltipIcon from '@assets/svg/info-tooltip.svg';
import WarningTooltipIcon from '@assets/svg/warning-tooltip.svg';
import CheckmarkIcon from '@assets/svg/checkmark-dark-green.svg';
import CrossIcon from '@assets/svg/cross.svg';

import Button from '@popup/shared/Button';
import Modal from '@popup/shared/Modal';
import { useDisplayAttributeValue, useGetAttributeName } from '@popup/shared/utils/identity-helpers';
import { ConfirmedIdentity } from '@shared/storage/types';
import ExternalLink from '@popup/shared/ExternalLink';
import urls from '@shared/constants/url';
import {
    SecretStatement,
    canProveStatement,
    useStatementDescription,
    useStatementHeader,
    useStatementValue,
    useStatementName,
} from './utils';

export type StatementLine = {
    attribute: string;
    value: string;
    isRequirementMet: boolean;
};

type StatementLineProps = StatementLine & ClassName;

export function DisplayStatementLine({ attribute, value, isRequirementMet, className }: StatementLineProps) {
    return (
        <li className={clsx(className, 'display-statement__line')}>
            <div className="display-statement__line-attribute">{attribute}:</div>
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
            <h3>
                {reveal ? (
                    <Trans
                        ns="idProofRequest"
                        i18nKey="displayStatement.revealTooltip.header"
                        components={{ 1: <WarningTooltipIcon className="display-statement__tooltip-icon" /> }}
                    />
                ) : (
                    t('secretTooltip.header')
                )}
            </h3>
            <div className="white-space-break">
                <Trans
                    ns="idProofRequest"
                    i18nKey={reveal ? 'displayStatement.revealTooltip.body' : 'displayStatement.secretTooltip.body'}
                    components={{ 1: <ExternalLink path={urls.zkpDocumentation} /> }}
                />
            </div>
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
                {lines.map((l, i) => (
                    <DisplayStatementLine
                        // eslint-disable-next-line react/no-array-index-key
                        key={i} // Allow this, as we don't expect these to ever change.
                        {...l}
                    />
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

type BaseProps = ClassName & {
    identity: ConfirmedIdentity;
    dappName: string;
    onInvalid(): void;
};

export function DisplayRevealStatement({
    dappName,
    statements,
    identity,
    className,
    onInvalid,
}: DisplayRevealStatementProps) {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement' });
    const getAttributeName = useGetAttributeName();
    const displayAttribute = useDisplayAttributeValue();
    const attributes =
        identity.idObject.value.attributeList.chosenAttributes ?? ({} as AttributeList['chosenAttributes']);
    const header = t('headers.reveal');

    const lines: StatementLine[] = statements.map((s) => {
        const raw = attributes[s.attributeTag];
        const value = displayAttribute(s.attributeTag, attributes[s.attributeTag] ?? '');

        return {
            attribute: getAttributeName(s.attributeTag),
            value: value ?? 'Unavailable',
            isRequirementMet: raw !== undefined,
        };
    });

    const isInvalid = lines.some((l) => !l.isRequirementMet);

    useEffect(() => {
        if (lines.some((l) => !l.isRequirementMet)) {
            onInvalid();
        }
    }, [isInvalid]);

    return <DisplayStatementView reveal lines={lines} dappName={dappName} header={header} className={className} />;
}

type DisplayRevealStatementProps = BaseProps & {
    statements: RevealStatement[];
};

type DisplaySecretStatementProps = BaseProps & {
    statement: SecretStatement;
};

export function DisplaySecretStatement({
    dappName,
    statement,
    identity,
    className,
    onInvalid,
}: DisplaySecretStatementProps) {
    const header = useStatementHeader(statement);
    const value = useStatementValue(statement);
    const description = useStatementDescription(statement, identity);
    const attribute = useStatementName(statement);
    const isRequirementMet = canProveStatement(statement, identity);

    const lines: StatementLine[] = [
        {
            attribute,
            value,
            isRequirementMet,
        },
    ];

    useEffect(() => {
        if (!isRequirementMet) {
            onInvalid();
        }
    }, [isRequirementMet]);

    return (
        <DisplayStatementView
            lines={lines}
            dappName={dappName}
            header={header}
            description={description}
            className={className}
        />
    );
}
