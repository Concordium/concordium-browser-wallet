import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';
import { ClassName, noOp } from 'wallet-common-helpers';
import { RequiredControlledFieldProps, CommonFieldProps } from '../common/types';
import { makeControlled } from '../common/utils';
import ErrorMessage from '../ErrorMessage';

type RadioProps = Omit<RequiredControlledFieldProps, 'valid' | 'error'> &
    Pick<InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onChange' | 'checked'> & {
        label: string;
        id: string;
    };

function Radio({ label, id, ...inputProps }: RadioProps) {
    return (
        <label className="form-radios__radio">
            <input type="radio" value={id} {...inputProps} />
            <div>{label}</div>
        </label>
    );
}

type Option<T> = {
    label: string;
    value: T;
};

export type RadiosProps<T = unknown> = Omit<RequiredControlledFieldProps, 'onChange'> &
    Omit<CommonFieldProps, 'note'> &
    ClassName & {
        options: Option<T>[];
        value: T | undefined;
        onChange?(value: T): void;
        onBlur?(): void;
    };

/**
 *  Use to select one of many options (as with <input type="radio" />). Is also to use within the context of a <Form /> on <Form.Radios />
 *
 *  @example
 *  const options = [{label: '1' value: 1}, {label: '2' value: 2}];
 *  const [val, setVal] = useState(1);
 *
 *  <Radios options={options} value={val} onChange={setVal} />
 */
export default function Radios<T>({
    options,
    value,
    error,
    valid,
    label,
    className,
    onChange = noOp,
    ...inputProps
}: RadiosProps<T>) {
    return (
        <div className={clsx('form-radios', className)}>
            {label && <div className="text-center m-b-5">{label}</div>}
            <div className={clsx('form-radios__options', error !== undefined && 'form-radios__options--invalid')}>
                {options.map((o, i) => (
                    <Radio
                        key={o.label}
                        checked={o.value === value}
                        id={`${i}`}
                        onChange={() => onChange(o.value)}
                        label={o.label}
                        {...inputProps}
                    />
                ))}
            </div>
            <ErrorMessage className="form-input__error">{error}</ErrorMessage>
        </div>
    );
}

export const FormRadios = makeControlled(Radios);
