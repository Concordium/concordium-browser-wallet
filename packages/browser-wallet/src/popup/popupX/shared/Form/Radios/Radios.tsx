import { RequiredControlledFieldProps } from '@popup/shared/Form/common/types';
import React, { InputHTMLAttributes, forwardRef } from 'react';
import { makeUncontrolled } from '../common/utils';

type RadioProps = Omit<RequiredControlledFieldProps, 'valid' | 'error'> &
    Pick<InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onChange' | 'checked'> & {
        label: string;
        id: string;
    };

const Radio = forwardRef<HTMLInputElement, RadioProps>(({ id, label, ...inputProps }, ref) => {
    return (
        <label className="form-radios-x__radio">
            <input type="radio" value={id} {...inputProps} ref={ref} />
            <span className="checkmark" />
            <span>{label}</span>
        </label>
    );
});

export default Radio;
export const FormRadio = makeUncontrolled(Radio);
