import { CommonFieldProps, RequiredControlledFieldProps } from '@popup/shared/Form/common/types';
import { makeControlled } from '@popup/shared/Form/common/utils';
import Slider from '@popup/shared/Form/Slider';
import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';
import { PropsOf } from 'wallet-common-helpers';

interface CommissionFieldProps {
    label: string;
    name: string;
    /** Decimal */
    min: number;
    /** Decimal */
    max: number;
}

const commonSliderProps: Pick<PropsOf<typeof Slider>, 'step' | 'unit' | 'className'> = {
    step: 0.001,
    unit: '%',
    className: 'm-b-10',
};

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'autoFocus'> &
    RequiredControlledFieldProps &
    CommonFieldProps &
    CommissionFieldProps;

export function CommissionInput({
    error,
    className,
    type,
    name,
    min,
    max,
    label,
    note,
    valid,
    onChange,
    onBlur,
    value,
    ...props
}: Props) {
    const minPercentage = min * 100;
    const maxPercentage = max * 100;

    if (min === max) {
        return (
            <>
                <input type="hidden" name={name} value={minPercentage} {...props} />
                <div className={clsx('baking__commissionField-slider', className)}>
                    {label && <div className="baking__commissionField-label">{label}</div>}
                    <div className="baking__commissionField-value">{minPercentage}%</div>
                </div>
            </>
        );
    }

    return (
        <Slider
            value={value}
            label={label}
            name={name}
            min={minPercentage}
            max={maxPercentage}
            onChange={onChange}
            onBlur={onBlur}
            {...commonSliderProps}
        />
    );
}

const CommissionsField = makeControlled(CommissionInput);
export default CommissionsField;
