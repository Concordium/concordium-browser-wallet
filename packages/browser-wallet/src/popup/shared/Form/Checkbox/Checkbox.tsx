import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes, ReactElement } from 'react';
import { makeUncontrolled } from '../common/utils';
import { CommonFieldProps, RequiredUncontrolledFieldProps } from '../common/types';
import ErrorMessage from '../ErrorMessage';

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className'> &
    RequiredUncontrolledFieldProps<HTMLInputElement> &
    CommonFieldProps & { description?: ReactElement; checked?: boolean; tabIndex?: number; readOnly?: boolean };

export const Checkbox = forwardRef<HTMLInputElement, Props>(
    ({ error, note, className, description, ...props }, ref) => {
        return (
            <>
                <label className={clsx('form-input__checkbox', className)}>
                    <input className={clsx(description && 'm-r-10')} type="checkbox" ref={ref} {...props} />
                    {description && description}
                </label>
                {error ? (
                    <ErrorMessage className="form-input__error">{error}</ErrorMessage>
                ) : (
                    note && <div className="form-input__note">{note}</div>
                )}
            </>
        );
    }
);

const FormCheckbox = makeUncontrolled<HTMLInputElement, Props>(Checkbox);

export default FormCheckbox;
