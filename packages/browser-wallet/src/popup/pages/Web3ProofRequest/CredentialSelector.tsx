import Button from '@popup/shared/Button';
import Modal from '@popup/shared/Modal';
import React, { ComponentType, useState } from 'react';
import ArrowIcon from '@assets/svg/down-arrow.svg';

interface Props<T> {
    /**
     * Must include at least 1 option
     */
    options: T[];
    initialIndex?: number;
    onChange: (x: T) => void;
    DisplayOption: ComponentType<{ option: T }>;
    header: string;
}

/**
 * Component to select a credential, either account credential or web3Id credential.
 */
export default function CredentialSelector<T extends string | number | object>({
    options,
    initialIndex = 0,
    onChange,
    DisplayOption,
    header,
}: Props<T>) {
    const [chosenIndex, setChosenIndex] = useState<number>(initialIndex);
    const [open, setOpen] = useState(false);

    if (options.length === 0) {
        throw new Error('No options given to selector');
    }

    function onClick(index: number) {
        setChosenIndex(index);
        onChange(options[index]);
        setOpen(false);
    }

    return (
        <Modal
            disableClose
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            trigger={
                <Button clear className="verifiable-credential__selector-trigger">
                    <DisplayOption option={options[chosenIndex]} />
                    <ArrowIcon className="verifiable-credential__selector-trigger-icon" />
                </Button>
            }
            className="verifiable-credential__selector-modal"
        >
            <div className="bodyL verifiable-credential__selector-header">
                <p>{header}</p>
                <ArrowIcon className="verifiable-credential__selector-header-icon" />
            </div>
            {options.map((opt, index) => (
                <Button
                    className="verifiable-credential__selector-item"
                    clear
                    key={opt.toString()}
                    onClick={() => onClick(index)}
                >
                    <DisplayOption option={options[index]} />
                </Button>
            ))}
        </Modal>
    );
}
