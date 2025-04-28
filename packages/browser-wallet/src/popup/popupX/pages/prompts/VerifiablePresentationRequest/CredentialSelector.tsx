import React, { ComponentType } from 'react';

import SelectIcon from '@assets/svgX/caret-up-down.svg';
import { ClassName } from 'wallet-common-helpers';
import clsx from 'clsx';
import { Select } from '@popup/popupX/shared/Form/Select';

export type CredentialSelectorDisplayProps<T> = {
    option: T;
};

type Props<T> = ClassName & {
    /**
     * Must include at least 1 option
     */
    options: T[];
    value: T;
    onChange: (x: T) => void;
    Display: ComponentType<CredentialSelectorDisplayProps<T>>;
    id(value: T): string;
};

/**
 * Component to select a credential, either account credential or web3Id credential.
 */
export default function CredentialSelector<T extends string | number | object>({
    options,
    value,
    onChange,
    Display,
    id,
    className,
}: Props<T>) {
    if (options.length === 0) {
        throw new Error('No options given to selector');
    }

    return (
        <Select
            className={clsx('verifiable-presentation-request__cred-selector', className)}
            options={options}
            renderOption={(v) => <Display option={v} />}
            icon={<SelectIcon />}
            id={id}
            value={value}
            onChange={onChange}
        />
    );
}
