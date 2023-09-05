import clsx from 'clsx';
import React from 'react';
import { ClassName } from 'wallet-common-helpers';

import CheckmarkIcon from '@assets/svg/check_small.svg';
import CrossIcon from '@assets/svg/cross.svg';

export type StatementLine = {
    attribute: string;
    value: string;
    isRequirementMet: boolean;
};

type StatementLineProps = StatementLine & ClassName;

export function DisplayStatementLine({ attribute, value, isRequirementMet, className }: StatementLineProps) {
    return (
        <li className={clsx(className, 'display-statement__line')}>
            <div className="display-statement__line-attribute heading6">{attribute}:</div>
            <div className="display-statement__line-value bodyM">
                {value}
                {isRequirementMet ? (
                    <CheckmarkIcon className="display-statement__line-check display-statement-checkmark" />
                ) : (
                    <CrossIcon className="display-statement__line-cross display-statement-cross" />
                )}
            </div>
        </li>
    );
}
