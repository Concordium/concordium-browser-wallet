/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';

import { CommonFieldProps, RequiredUncontrolledFieldProps } from '../common/types';
import { makeUncontrolled } from '../common/utils';
import ErrorMessage from '../ErrorMessage';

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type' | 'value' | 'onChange' | 'onBlur'> &
    RequiredUncontrolledFieldProps<HTMLInputElement> &
    CommonFieldProps;

/**
 * @description
 * Use as a normal \<input /\>. Should NOT be used for checkbox or radio.
 */
export const Input = forwardRef<HTMLInputElement, Props>(
    ({ error, className, type = 'text', label, note, valid, ...props }, ref) => {
        return (
            <label
                className={clsx(
                    'form-input',
                    error !== undefined && 'form-input--invalid',
                    valid && 'form-input--valid',
                    className
                )}
            >
                <input
                    className={clsx('form-input__field')}
                    type={type}
                    ref={ref}
                    autoComplete="off"
                    spellCheck="false"
                    {...props}
                />
                {label && <div className="form-input__label">{label}</div>}
                {error ? (
                    <ErrorMessage className="form-input__error">{error}</ErrorMessage>
                ) : (
                    note && <div className="form-input__note">{note}</div>
                )}
            </label>
        );
    }
);

const FormInput = makeUncontrolled<HTMLInputElement, Props>(Input);

export default FormInput;
