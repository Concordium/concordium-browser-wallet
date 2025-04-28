import React, { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

import { CommonFieldProps, RequiredUncontrolledFieldProps } from '../common/types';
import { makeUncontrolled } from '../common/utils';
import ErrorMessage from '../ErrorMessage';

type Props = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | 'className'
    | 'type'
    | 'value'
    | 'onChange'
    | 'onBlur'
    | 'autoFocus'
    | 'readOnly'
    | 'placeholder'
    | 'step'
    | 'min'
    | 'max'
> &
    RequiredUncontrolledFieldProps<HTMLInputElement> &
    CommonFieldProps;

/**
 * @description
 * Use as a normal \<input /\>. Should NOT be used for checkbox or radio.
 */
export const Input = forwardRef<HTMLInputElement, Props>(
    ({ error, className, type = 'text', label, note, valid, readOnly, ...props }, ref) => {
        return (
            <label
                className={clsx(
                    'form-input',
                    error !== undefined && 'form-input--invalid',
                    valid && 'form-input--valid',
                    readOnly && 'form-input--read-only',
                    className
                )}
            >
                <input
                    className={clsx('form-input__field text__main_medium')}
                    type={type}
                    ref={ref}
                    autoComplete="off"
                    spellCheck="false"
                    readOnly={readOnly}
                    {...props}
                />
                {label && <div className="form-input__label capture__main_small">{label}</div>}
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
