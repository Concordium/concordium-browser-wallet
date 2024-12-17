import clsx from 'clsx';
import React from 'react';
import { ClassName } from 'wallet-common-helpers';

export type StatementLine = {
    attribute: string;
    value: string;
    isRequirementMet: boolean;
};

type StatementLineProps = StatementLine & ClassName;

export function DisplayStatementLine({ attribute, value, isRequirementMet, className }: StatementLineProps) {
    return (
        <div
            className={clsx(
                className,
                'display-statement-x__line',
                isRequirementMet && 'display-statement-x__line--valid'
            )}
        >
            <div>{attribute}</div>
            <div>{value}</div>
        </div>
    );
}
