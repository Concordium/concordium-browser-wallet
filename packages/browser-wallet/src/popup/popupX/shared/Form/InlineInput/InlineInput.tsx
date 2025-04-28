import clsx from 'clsx';
import React, { InputHTMLAttributes, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { noOp, useUpdateEffect } from 'wallet-common-helpers';
import { scaleFieldWidth } from '@popup/shared/utils/html-helpers';
import { CommonFieldProps, RequiredControlledFieldProps } from '../common/types';
import { makeControlled } from '../common/utils';

type Props = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'className' | 'autoFocus' | 'onKeyUp' | 'onMouseUp' | 'maxLength' | 'min' | 'max'
> &
    RequiredControlledFieldProps &
    CommonFieldProps & {
        fallbackValue?: string;
        fallbackOnError?: boolean;
        fixedWidth?: number;
    };

export function InlineInput({
    className,
    type = 'text',
    value,
    fallbackValue,
    fallbackOnError = false,
    onChange = noOp,
    onBlur = noOp,
    fixedWidth,
    error,
    ...props
}: Props) {
    const ref = useRef<HTMLInputElement>(null);
    const [innerValue, setInnerValue] = useState(value ?? fallbackValue);

    useLayoutEffect(() => {
        if (!fixedWidth) {
            scaleFieldWidth(ref.current);
        }
    }, [innerValue]);

    useUpdateEffect(() => {
        setInnerValue(value);
    }, [value]);

    const handleBlur = useCallback(() => {
        if (fallbackValue === undefined) {
            onBlur();
            return;
        }

        if (!value || (fallbackOnError && error)) {
            onChange(fallbackValue);
        }

        onBlur();
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
            autoComplete="off"
            spellCheck="false"
            {...props}
            style={{ width: fixedWidth || 6 }} // To prevent initial UI jitter.
        />
    );
}

const FormInlineInput = makeControlled(InlineInput);
export default FormInlineInput;
