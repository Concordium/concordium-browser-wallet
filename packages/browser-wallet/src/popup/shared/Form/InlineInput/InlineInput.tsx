import clsx from 'clsx';
import React, { InputHTMLAttributes, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { noOp } from 'wallet-common-helpers';

import { useUpdateEffect } from '../../utils/hooks';
import { scaleFieldWidth } from '../../utils/htmlHelpers';
import { CommonFieldProps, RequiredControlledFieldProps } from '../common/types';
import { makeControlled } from '../common/utils';

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'autoFocus'> &
    RequiredControlledFieldProps &
    CommonFieldProps & {
        fallbackValue: string;
    };

export function InlineInput({
    className,
    type = 'text',
    value,
    fallbackValue,
    onChange = noOp,
    onBlur = noOp,
    error,
    ...props
}: Props) {
    const ref = useRef<HTMLInputElement>(null);
    const [innerValue, setInnerValue] = useState(value ?? fallbackValue);

    useLayoutEffect(() => {
        scaleFieldWidth(ref.current);
    }, [innerValue]);

    useUpdateEffect(() => {
        setInnerValue(value);
    }, [value]);

    const handleBlur = useCallback(() => {
        onBlur();
        if (!value) {
            onChange(fallbackValue);
        }
    }, [onBlur, value, fallbackValue, onChange]);

    return (
        <input
            className={clsx('form-inline-input', error !== undefined && 'form-inline-input--invalid', className)}
            type={type}
            value={value}
            defaultValue={fallbackValue}
            onChange={(e) => onChange(e.currentTarget.value)}
            onBlur={handleBlur}
            ref={ref}
            {...props}
            style={{ width: 6 }} // To prevent initial UI jitter.
        />
    );
}

const FormInlineInput = makeControlled(InlineInput);
export default FormInlineInput;
