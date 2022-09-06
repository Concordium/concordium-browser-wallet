/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import { getCcdSymbol } from 'wallet-common-helpers';
import Button from '@popup/shared/Button';

import { CommonFieldProps, RequiredUncontrolledFieldProps } from './common/types';
import { makeUncontrolled } from './common/utils';
import ErrorMessage from './ErrorMessage';

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type' | 'value' | 'onChange' | 'onBlur'> &
    RequiredUncontrolledFieldProps<HTMLInputElement> &
    CommonFieldProps & {
        onMax: () => void;
    };

/**
 * @description
 * Use as a normal \<input /\>. Should NOT be used for checkbox or radio.
 */
export const CcdInput = forwardRef<HTMLInputElement, Props>(
    ({ error, className, type = 'text', label, note, valid, onMax, ...props }, ref) => {
        return (
            <label
                className={clsx(
                    'form-input',
                    error !== undefined && 'form-input--invalid',
                    valid && 'form-input--valid',
                    className
                )}
            >
                <p className="form-ccd-input__symbol">{getCcdSymbol()}</p>
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

const FormCcdInput = makeUncontrolled<HTMLInputElement, Props>(CcdInput);

export default FormCcdInput;