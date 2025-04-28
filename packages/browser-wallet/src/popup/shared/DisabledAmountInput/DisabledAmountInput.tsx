import clsx from 'clsx';
import React from 'react';

interface Props {
    label: string;
    note?: string;
    className?: string;
}

/**
 * Component that looks like the AmountInput, but displays the given label instead of providing the input field.
 */
export default function DisabledAmountInput({ label, note, className }: Props) {
    return (
        <label className={clsx('form-input', className)}>
            <div className={clsx('disabled-amount-input__field', 'form-input__field')}>{label}</div>
            {note && <div className="form-input__note">{note}</div>}
        </label>
    );
}
