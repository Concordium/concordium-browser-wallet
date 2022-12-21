/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import Button from '@popup/shared/Button';

import { CommonFieldProps, RequiredUncontrolledFieldProps } from './common/types';
import { makeUncontrolled } from './common/utils';
import ErrorMessage from './ErrorMessage';

type Props = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'type' | 'value' | 'onChange' | 'onBlur' | 'autoFocus'
> &
    RequiredUncontrolledFieldProps<HTMLInputElement> &
    CommonFieldProps & {
        onMax?: () => void;
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
                <div className={clsx('form-amount-input__field', 'form-input__field')}>
                    <p className="form-amount-input__symbol">{symbol}</p>
                    <input
                        className="form-inline-input"
                        type={type}
                        ref={ref}
                        autoComplete="off"
                        spellCheck="false"
                        {...props}
                    />
                    {onMax !== undefined && (
                        <Button onClick={onMax} className="form-amount-input__max">
                            Max
                        </Button>
                    )}
                </div>
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
