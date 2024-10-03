import { RequiredControlledFieldProps } from '@popup/shared/Form/common/types';
import React, { InputHTMLAttributes } from 'react';

type RadioProps = Omit<RequiredControlledFieldProps, 'valid' | 'error'> &
    Pick<InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onChange' | 'checked'> & {
        label: string;
        id: string;
    };

export default function Radio({ label, id, ...inputProps }: RadioProps) {
    return (
        <label className="form-radios-x__radio">
            <input type="radio" value={id} {...inputProps} />
            <span className="checkmark" />
            <span>{label}</span>
        </label>
    );
}
