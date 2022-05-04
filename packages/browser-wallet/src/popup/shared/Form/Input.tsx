/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';

import { CommonFieldProps, RequiredUncontrolledFieldProps } from './common/types';
import { makeUncontrolled } from './common/utils';
import ErrorMessage from './ErrorMessage';

export type InputProps = Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> &
    RequiredUncontrolledFieldProps &
    CommonFieldProps;

/**
 * @description
 * Use as a normal \<input /\>. Should NOT be used for checkbox or radio.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, className, type = 'text', label, ...props }, ref) => {
        return (
            <label className={clsx('form-input', error !== undefined && 'form-input--invalid', className)}>
                {label !== undefined && <div>{label}</div>}
                <input className={clsx('form-input__field')} type={type} ref={ref} {...props} />
                <ErrorMessage>{error}</ErrorMessage>
            </label>
        );
    }
);

const FormInput = makeUncontrolled(Input);

export default FormInput;
