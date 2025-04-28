import React, { ClipboardEventHandler, useRef, useState } from 'react';
import clsx from 'clsx';
import Text from '@popup/popupX/shared/Text';
import { makeControlled } from '@popup/popupX/shared/Form/common/utils';
import ErrorMessage from '@popup/shared/Form/ErrorMessage';
import { CommonFieldProps } from '@popup/shared/Form/common/types';
import { RequiredControlledFieldProps } from '@popup/popupX/shared/Form/common/types';
import { noOp } from 'wallet-common-helpers';

interface Props extends CommonFieldProps, RequiredControlledFieldProps {
    value: string | undefined;
    onChange?(value: string | undefined): void;
    className?: string;
    name: string;
    isInvalid?: boolean;
    readOnly?: boolean;
    initialValue?: string;
    onPaste?: ClipboardEventHandler<HTMLInputElement>;
}

export function SeedPhrase({
    error,
    className,
    label,
    note,
    valid,
    initialValue,
    readOnly,
    onChange = noOp,
    onPaste,
    ...props
}: Props) {
    const innerRef = useRef<HTMLInputElement>(null);
    const [seedPhrase, setSeedPhrase] = useState<string[]>(initialValue?.split(' ') || []);
    const [inputValue, setInputValue] = useState<string>('');

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (value.includes(' ')) {
            const seed = [...seedPhrase, ...value.split(' ').filter(Boolean)];
            setSeedPhrase(seed);
            setInputValue('');
            onChange(seed.join(' '));
        } else {
            setInputValue(value);
        }
    };
    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { key } = e;
        if (key === 'Backspace' && seedPhrase.length > 0 && inputValue === '') {
            setInputValue(seedPhrase.pop() || '');
            setSeedPhrase(seedPhrase);
        }
    };
    const focusChild = () => {
        innerRef.current?.focus();
    };

    return (
        <div className="form-input__seed-phrase-x">
            <div className="card-x grey" onClick={focusChild} role="none">
                {seedPhrase.map((word, idx) => {
                    const key = `${word}:${idx}`;
                    return <Text.LabelRegular key={key}>{word}</Text.LabelRegular>;
                })}
                <input
                    type="text"
                    ref={innerRef}
                    className={clsx('form-input__field label__regular')}
                    value={inputValue}
                    onChange={(e) => handleInput(e)}
                    onKeyUp={handleKeyUp}
                    onPaste={onPaste}
                    disabled={readOnly}
                />
                <input type="hidden" {...props} value={initialValue} />
            </div>
            {error && <ErrorMessage className="form-input__error">{error}</ErrorMessage>}
        </div>
    );
}

const FormSeedPhrase = makeControlled(SeedPhrase);
export default FormSeedPhrase;
