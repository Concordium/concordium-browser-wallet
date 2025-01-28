import React from 'react';
import RcSlider from 'rc-slider';
import clsx from 'clsx';
import { noOp } from 'wallet-common-helpers';
import { CommonFieldProps, RequiredControlledFieldProps } from '../common/types';
import { InlineInput } from '../InlineInput';
import { makeControlled } from '../common/utils';
import ErrorMessage from '../ErrorMessage';
import Text from '../../Text';

interface Props extends CommonFieldProps, RequiredControlledFieldProps {
    /** The minimum value of the slider. */
    min: number;
    /** The maximum value of the slider. */
    max: number;
    /** The step value of the slider. */
    step: number;
    /** The unit to display next to the value. */
    unit?: string;
    /** The current value of the slider. */
    value: number | undefined;
    /** Change handler callback */
    onChange?(value: number | undefined): void;
    /** Additional class names for the slider. */
    className?: string;
    /** The name for the input field */
    name: string;
    /** Flag to indicate if the slider is in an invalid state. */
    isInvalid?: boolean;
}

/**
 * Slider component to select a value within a range.
 *
 * @example
 * const [value, setValue] = useState();
 * <Slider
 *   min={0}
 *   max={100}
 *   step={0.01}
 *   unit="%"
 *   value={value}
 *   onChange={setValue}
 *   name="commission"
 * />
 */
export function Slider({
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
    isInvalid,
    error,
}: Props) {
    const handleChange = (v: string) => {
        if (v !== '') {
            onChange(Number(v));
        } else {
            onChange(undefined);
        }
    };
    const parsed = value ?? '';

    if (min > max) {
        throw new Error('Prop "min" must be lower that prop "max"');
    }

    return (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        <>
            <label
                className={clsx(
                    'form-input form-input__field form-slider-x',
                    isInvalid && 'form-slider-x--invalid',
                    className
                )}
            >
                <Text.Capture className="form-input__label">{label}</Text.Capture>
                <InlineInput
                    name={name}
                    label={label}
                    onBlur={onBlur}
                    type="number"
                    min={min}
                    max={max}
                    value={parsed}
                    onChange={handleChange}
                />
                {value !== undefined && unit}
                <RcSlider
                    className="form-slider-x__slider"
                    value={value ?? min}
                    onChange={onChange}
                    min={min}
                    max={max}
                    step={step}
                />
            </label>
            <ErrorMessage>{error}</ErrorMessage>
        </>
    );
}

/**
 * Slider component to select a value within a range in the context of a `<Form>`
 *
 * @example
 * <Form<{commission: number}> ...>
 * {form =>
 *   <FormSlider
 *     min={0}
 *     max={100}
 *     step={0.01}
 *     unit="%"
 *     control={f.control}
 *     name="commission"
 *   />
 * }
 * </Form>
 */
const FormSlider = makeControlled(Slider);
export default FormSlider;
