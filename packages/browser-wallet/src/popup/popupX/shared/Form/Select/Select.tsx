import React, { ReactNode, useCallback } from 'react';
import { ClassName } from 'wallet-common-helpers';
import clsx from 'clsx';

import SideArrow from '@assets/svgX/side-arrow.svg';
import { makeControlled } from '../common/utils';
import { RequiredControlledFieldProps } from '../common/types';

type Props<T> = RequiredControlledFieldProps<T> &
    ClassName & {
        /** Invoked to render the selected value. Defaults to `renderOption` */
        children?(value: T | undefined): ReactNode;
        /** The selected value */
        value: T | undefined;
        /** The list of options to select from */
        options: T[];
        /** Invoked to identify options internally. Must provide unique results for each option */
        id(value: T): string;
        /** Determines how each option is rendered in the internal `<option>` */
        renderOption(value: T): ReactNode;
        /** Change event handler */
        onChange(value: T): void;
        /** Blur event handler */
        onBlur?(): void;
        /** Whether the field should be read only. Setting this to `true` will disable the dropdown. */
        readonly?: boolean;
        /** The icon to render next to `children` to indicate the presence of a dropdown */
        icon?: JSX.Element;
    };

/**
 * Simple component wrapping a `<select>` element for selecting from the supplied list of options.
 */
export function Select<T>({
    readonly = false,
    renderOption,
    children = renderOption,
    value,
    id,
    onChange,
    options,
    onBlur,
    icon = <SideArrow />,
    className,
}: Props<T>) {
    const findSelected = useCallback(
        (v: string) => options.find((o) => id(o) === v)!, // we unwrap, as it's not suppcosed to fail and crashing is fair.
        [id, options]
    );

    return (
        <label className={clsx('form-select', className)}>
            {!readonly && (
                <select
                    value={value !== undefined ? id(value) : undefined}
                    onChange={(e) => onChange(findSelected(e.target.value))}
                    onBlur={onBlur}
                >
                    {options.map((o) => {
                        const v = id(o);
                        return (
                            <option key={v} value={v}>
                                {renderOption(o)}
                            </option>
                        );
                    })}
                </select>
            )}
            <span className="flex">{children(value)}</span>
            {!readonly && icon}
        </label>
    );
}

const FormSelect = makeControlled(Select);
export default FormSelect;
