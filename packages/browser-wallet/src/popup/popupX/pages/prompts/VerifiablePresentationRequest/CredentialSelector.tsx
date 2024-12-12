import React, { ComponentType, useMemo } from 'react';

export type CredentialSelectorDisplayProps<T> = {
    option: T;
};

interface Props<T> {
    /**
     * Must include at least 1 option
     */
    options: T[];
    value: T;
    onChange: (x: T) => void;
    Display: ComponentType<CredentialSelectorDisplayProps<T>>;
    id(value: T): string;
}

/**
 * Component to select a credential, either account credential or web3Id credential.
 */
export default function CredentialSelector<T extends string | number | object>({
    options,
    value,
    onChange,
    Display,
    id,
}: Props<T>) {
    const selected = useMemo(() => id(value), [id, value]);

    if (options.length === 0) {
        throw new Error('No options given to selector');
    }

    function onSelect(option: string) {
        onChange(options.find((o) => id(o) === option)!);
    }

    return (
        <select onChange={(e) => onSelect(e.target.value)} value={selected}>
            {options.map((o) => (
                <option value={id(o)}>
                    <Display option={o} />
                </option>
            ))}
        </select>
    );
}
