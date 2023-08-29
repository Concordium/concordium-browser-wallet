import Button from '@popup/shared/Button';
import Modal from '@popup/shared/Modal';
import React, { ComponentType, useState } from 'react';

interface Props<T> {
    options: T[];
    initialIndex?: number;
    onChange: (x: T) => void;
    DisplayOption: ComponentType<{ option: T }>;
}

/**
 * Component to select a credential, either account credential or web3Id credential.
 */
export default function CredentialSelector<T extends string | number | object>({
    options,
    initialIndex = 0,
    onChange,
    DisplayOption,
}: Props<T>) {
    const [chosenIndex, setChosenIndex] = useState<number>(initialIndex);
    const [open, setOpen] = useState(false);

    if (options.length === 0) {
        return null;
    }

    function onClick(index: number) {
        setChosenIndex(index);
        onChange(options[index]);
    }

    return (
        <Modal
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            trigger={
                <Button clear className="flex m-10 verifiable-credential__selector">
                    <DisplayOption option={options[chosenIndex]} />
                </Button>
            }
        >
            {options.map((opt, index) => (
                <Button clear key={opt.toString()} onClick={() => onClick(index)}>
                    <DisplayOption option={options[index]} />
                </Button>
            ))}
        </Modal>
    );
}
