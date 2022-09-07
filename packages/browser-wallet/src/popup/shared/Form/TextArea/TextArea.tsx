/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { forwardRef, TextareaHTMLAttributes } from 'react';

import { CommonFieldProps, RequiredUncontrolledFieldProps } from '../common/types';
import { makeUncontrolled } from '../common/utils';
import ErrorMessage from '../ErrorMessage';

type Props = Pick<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'className' | 'value' | 'onChange' | 'onBlur' | 'readOnly'
> &
    RequiredUncontrolledFieldProps<HTMLTextAreaElement> &
    CommonFieldProps;

/**
 * @description
 * Use as a normal \<textarea /\>.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
    ({ error, className, label, note, valid, readOnly, ...props }, ref) => {
        return (
            <label
                className={clsx(
                    'form-input',
                    error !== undefined && 'form-input--invalid',
                    valid && 'form-input--valid',
                    className
                )}
            >
                <textarea
                    className={clsx('form-input__area')}
                    style={{ resize: 'none' }}
                    ref={ref}
                    autoComplete="off"
                    spellCheck="false"
                    readOnly={readOnly}
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

const FormInput = makeUncontrolled<HTMLTextAreaElement, Props>(TextArea);

export default FormInput;
