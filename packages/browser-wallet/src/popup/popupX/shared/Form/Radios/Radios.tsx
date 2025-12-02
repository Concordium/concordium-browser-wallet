import { RequiredControlledFieldProps } from '@popup/shared/Form/common/types';
import React, { InputHTMLAttributes, forwardRef } from 'react';
import Text from '@popup/popupX/shared/Text';
import { makeUncontrolled } from '../common/utils';

type RadioProps = Omit<RequiredControlledFieldProps, 'valid' | 'error'> &
    Pick<InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onChange' | 'checked'> & {
        label: string;
        subText?: string;
        id: string;
    };

const Radio = forwardRef<HTMLInputElement, RadioProps>(({ id, label, subText, ...inputProps }, ref) => {
    return (
        <label className="form-radios-x__radio">
            <input type="radio" value={id} {...inputProps} ref={ref} />
            <span className="checkmark" />
            <span className="text-container">
                <span>{label}</span>
                <Text.Capture>{subText}</Text.Capture>
            </span>
        </label>
    );
});

export default Radio;
export const FormRadio = makeUncontrolled(Radio);
