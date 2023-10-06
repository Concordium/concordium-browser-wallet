import React, { useEffect, useState } from 'react';
import RcSlider from 'rc-slider';
import clsx from 'clsx';
import { noOp, toFixed, valueNoOp } from 'wallet-common-helpers';
import { CommonFieldProps } from '../common/types';
import { InlineInput } from '../InlineInput';

interface Props extends CommonFieldProps {
    min: number;
    max: number;
    step: number;
    unit?: string;
    value: number | undefined;
    onChange?(value: number | number[] | undefined): void;
    onBlur?(): void;
    className: string;
    name: string;
}

export default function Slider({
    min,
    max,
    step,
    label,
    unit = '',
    onChange = noOp,
    onBlur = noOp,
    value,
    className,
    name,
}: Props) {
    const [innerValue, setInnerValue] = useState<number | undefined>(value);
    const isInvalid = innerValue !== undefined && (Number.isNaN(innerValue) || innerValue > max || innerValue < min);

    const allowFractions = step < 1 && step > 0;
    const ensureDigits = allowFractions ? step.toString().split('.')[1].length : undefined;
    const formatNumber = ensureDigits ? toFixed(ensureDigits) : valueNoOp;

    useEffect(() => {
        onChange(innerValue);
    }, [innerValue, onChange]);

    const handleChange = (v: string | undefined) => {
        if (v === undefined) {
            setInnerValue(0);
            return;
        }

        const parser = Number.isInteger(step) ? parseInt : parseFloat;
        setInnerValue(parser(v));
    };

    const handleBlur = () => {
        onBlur();
        const parser = Number.isInteger(step) ? parseInt : parseFloat;
        setInnerValue(innerValue ? parser(formatNumber(innerValue.toString())) : innerValue);
    };

    if (min > max) {
        throw new Error('Prop "min" must be lower that prop "max"');
    }

    return (
        <label className={clsx('form-slider', isInvalid && 'form-slider__invalid', className)}>
            <label className="m-b-5">{label}</label>
            <div className="form-slider__grid">
                <span>
                    Min:
                    <br />
                    {formatNumber(min.toString())}
                    {unit}
                </span>
                <RcSlider
                    className="form-slider__slider"
                    value={innerValue}
                    onChange={(v: number) => setInnerValue(v)}
                    min={min}
                    max={max}
                    step={step}
                />
                <span>
                    Max:
                    <br />
                    {formatNumber(max.toString())}
                    {unit}
                </span>
                <div className="form-slider__inputWrapper">
                    <InlineInput
                        value={innerValue?.toString()}
                        error={isInvalid ? 'value must be number in range' : undefined}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fallbackValue={min.toString()}
                        name={name}
                        fallbackOnError
                    />
                    {unit}
                </div>
            </div>
        </label>
    );
}
