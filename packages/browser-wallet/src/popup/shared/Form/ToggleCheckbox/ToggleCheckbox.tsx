import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import { RequiredUncontrolledFieldProps } from '../common/types';
import { makeUncontrolled } from '../common/utils';

type Props = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'value' | 'onChange' | 'onBlur' | 'checked' | 'defaultChecked'
> &
    RequiredUncontrolledFieldProps<HTMLInputElement> & {
        icon?: JSX.Element;
    };

export const ToggleCheckbox = forwardRef<HTMLInputElement, Props>(
    ({ error, className, valid, icon, ...props }, ref) => {
        return (
            <div className={clsx('form-toggle__root', className)}>
                <label className={clsx('form-toggle__switch')}>
                    <input type="checkbox" ref={ref} {...props} />
                    <div className="form-toggle__track" />
                    <div className="form-toggle__handle">{icon !== undefined && icon}</div>
                </label>
            </div>
        );
    }
);

const FormToggleCheckbox = makeUncontrolled<HTMLInputElement, Props>(ToggleCheckbox);

export default FormToggleCheckbox;
