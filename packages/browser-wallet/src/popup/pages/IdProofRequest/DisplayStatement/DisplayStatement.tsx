import clsx from 'clsx';
import React from 'react';
import { Trans } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';

import SecretIcon from '@assets/svg/id-secret.svg';
import RevealIcon from '@assets/svg/id-reveal.svg';

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
            <div>
                {value} {isRequirementMet ? '√' : 'x'}
            </div>
        </li>
    );
}

type Props = ClassName & {
    reveal: boolean;
    lines: StatementLine[];
    dappName: string;
};

export default function DisplayStatement({ className, lines, reveal, dappName }: Props) {
    return (
        <section className={clsx('display-statement', className)}>
            <header className="display-statement__header">
                <div className="flex align-center">
                    {reveal ? <RevealIcon /> : <SecretIcon />}
                    <div className="m-l-5">Statement header</div>
                </div>
                {reveal ? <div>!</div> : <div>?</div>}
            </header>
            <ul className="list-clear p-5 m-0">
                {lines.map((l) => (
                    <DisplayStatementLine {...l} />
                ))}
            </ul>
            {reveal && (
                <div className="display-statement__reveal-description">
                    <Trans
                        ns="idProofRequest"
                        i18nKey="revealDescription"
                        components={{ 1: <strong /> }}
                        values={{ dappName }}
                    />
                </div>
            )}
        </section>
    );
}
