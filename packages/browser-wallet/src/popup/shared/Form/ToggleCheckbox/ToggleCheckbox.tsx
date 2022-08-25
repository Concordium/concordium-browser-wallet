import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import { RequiredUncontrolledFieldProps } from '../common/types';
import { makeUncontrolled } from '../common/utils';

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'value' | 'onChange' | 'onBlur'> &
    RequiredUncontrolledFieldProps<HTMLInputElement>;

export const ToggleCheckbox = forwardRef<HTMLInputElement, Props>(({ error, className, valid, ...props }, ref) => {
    return (
        <div className={clsx('form-toggle__root', className)}>
            <label className={clsx('form-toggle__switch')}>
                <input type="checkbox" ref={ref} {...props} />
                <div className="form-toggle__track" />
                <div className="form-toggle__handle" />
            </label>
        </div>
    );
});

const FormToggleCheckbox = makeUncontrolled<HTMLInputElement, Props>(ToggleCheckbox);

export default FormToggleCheckbox;
