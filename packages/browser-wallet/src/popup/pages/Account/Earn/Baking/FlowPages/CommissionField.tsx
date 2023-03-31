import { CommonFieldProps, RequiredUncontrolledFieldProps } from '@popup/shared/Form/common/types';
import { makeUncontrolled } from '@popup/shared/Form/common/utils';
import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';

interface CommissionFieldProps {
    label: string;
    name: string;
    /** Decimal */
    min: number;
    /** Decimal */
    max: number;
    /** Decimal */
    existing?: number;
}

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'autoFocus'> &
    RequiredUncontrolledFieldProps<HTMLInputElement> &
    CommonFieldProps &
    CommissionFieldProps;

// TODO Implement sliders for commissions
export const CommissionInput = forwardRef<HTMLInputElement, Props>(
    ({ error, className, type, name, min, max, label, note, valid, ...props }, ref) => {
        // Default to max percentage
        const value = max * 100;
        return (
            <>
                <input type="hidden" name={name} ref={ref} value={value} {...props} />
                <div className={clsx('baking__commissionField-slider', className)}>
                    {label && <div className="baking__commissionField-label">{label}</div>}
                    <div className="baking__commissionField-value">{value}%</div>
                </div>
            </>
        );
    }
);

const CommissionsField = makeUncontrolled(CommissionInput);
export default CommissionsField;
