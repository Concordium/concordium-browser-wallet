/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import Button from '@popup/shared/Button';

import { CommonFieldProps, RequiredUncontrolledFieldProps } from './common/types';
import { makeUncontrolled } from './common/utils';
import ErrorMessage from './ErrorMessage';

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type' | 'value' | 'onChange' | 'onBlur'> &
    RequiredUncontrolledFieldProps<HTMLInputElement> &
    CommonFieldProps & {
        onMax: () => void;
        symbol: string;
    };

// TODO: Handle different symbol lengths properly
/**
 * @description
 * Use as a normal \<input /\>. Should NOT be used for checkbox or radio.
 */
export const AmountInput = forwardRef<HTMLInputElement, Props>(
    ({ error, className, type = 'text', label, note, valid, onMax, symbol, ...props }, ref) => {
        return (
            <label
                className={clsx(
                    'form-input',
                    error !== undefined && 'form-input--invalid',
                    valid && 'form-input--valid',
                    className
                )}
            >
                <p className="form-ccd-input__symbol">{symbol}</p>
                <input
                    className={clsx('form-ccd-input__field', 'form-input__field')}
                    type={type}
                    ref={ref}
                    autoComplete="off"
                    spellCheck="false"
                    {...props}
                />
                <Button onClick={onMax} className="form-ccd-input__max">
                    Max
                </Button>
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

const FormAmountInput = makeUncontrolled<HTMLInputElement, Props>(AmountInput);

export default FormAmountInput;
