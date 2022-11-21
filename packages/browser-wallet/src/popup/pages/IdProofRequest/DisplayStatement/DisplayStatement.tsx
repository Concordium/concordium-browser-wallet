import clsx from 'clsx';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';

import SecretIcon from '@assets/svg/id-secret.svg';
import RevealIcon from '@assets/svg/id-reveal.svg';
import InfoTooltipIcon from '@assets/svg/info-tooltip.svg';
import WarningTooltipIcon from '@assets/svg/warning-tooltip.svg';
import CheckmarkIcon from '@assets/svg/checkmark-dark-green.svg';
import CrossIcon from '@assets/svg/cross.svg';

import Button from '@popup/shared/Button';
import Modal from '@popup/shared/Modal';

type StatementLine = {
    attribute: string;
    value: string;
    isRequirementMet: boolean;
};

type StatementLineProps = StatementLine;

function DisplayStatementLine({ attribute, value, isRequirementMet }: StatementLineProps) {
    return (
        <li className="display-statement__line">
            <div>{attribute}:</div>
            <div className="display-statement__line-separator" />
            <div className="flex align-center">
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

type BaseProps = ClassName & {
    header: string;
    lines: StatementLine[];
    dappName: string;
};

type RevealProps = BaseProps & {
    reveal: true;
};

type SecretProps = BaseProps & {
    reveal?: false;
    description?: string;
};

type Props = RevealProps | SecretProps;

export function DisplayStatementView({ className, lines, dappName, header, ...props }: Props) {
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

export default DisplayStatementView;
