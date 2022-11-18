import clsx from 'clsx';
import React from 'react';
import { ClassName } from 'wallet-common-helpers';

type StatementLineProps = {
    attribute: string;
    value: string;
    isRequirementMet: boolean;
};

function StatementLine({ attribute, value, isRequirementMet }: StatementLineProps) {
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

type Props = ClassName;

export default function DisplayStatement({ className }: Props) {
    return (
        <section className={clsx('display-statement', className)}>
            <header>Statement header</header>
            <ul className="list-clear">
                <StatementLine attribute="Attribute" value="Value" isRequirementMet />
            </ul>
        </section>
    );
}
