import React, { useState } from 'react';

interface Props<T> {
    options: T[];
    onChange: (x: T) => void;
    displayOption: (x: T) => string;
}

/**
 * Component to select a credential, either account credential or web3Id credential.
 */
export default function CredentialSelector<T>({ options, onChange, displayOption }: Props<T>) {
    const [chosenIndex, setChosenIndex] = useState<number>(0);

    if (options.length === 0) {
        // TODO Translate
        return <div>No candidate available</div>;
    }

    return (
        <select
            value={chosenIndex}
            onChange={(event) => {
                const index = Number(event.target.value);
                setChosenIndex(index);
                onChange(options[index]);
            }}
        >
            {options.map((opt, index) => (
                <option key={displayOption(opt)} value={index}>
                    {displayOption(opt)}
                </option>
            ))}
        </select>
    );
}
