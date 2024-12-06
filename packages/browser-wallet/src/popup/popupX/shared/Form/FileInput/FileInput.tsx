import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ErrorMessage from '../ErrorMessage';
import Button from '../../Button';

export interface FileInputRef {
    reset(): void;
}

export type FileInputValue = FileList | null;

export type FileInputProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'accept' | 'multiple' | 'placeholder' | 'disabled' | 'className'
> & {
    buttonTitle: string;
    value: FileInputValue;
    disableFileNames?: boolean;
    onChange(files: FileInputValue): void;
    valid: boolean;
    error?: string;
};

/**
 * @description
 * Component for handling file input. Parsing of file should be done externally. Supports drag and drop + click to browse.
 *
 * @example
 * <FileInput value={files} onChange={setFiles} />
 */
export const FileInput = forwardRef<FileInputRef, FileInputProps>(
    (
        { value, onChange, valid, error, placeholder, className, buttonTitle, disableFileNames = false, ...inputProps },
        ref
    ): JSX.Element => {
        const inputRef = useRef<HTMLInputElement>(null);
        const [dragOver, setDragOver] = useState<boolean>(false);
        const files = useMemo(() => new Array(value?.length ?? 0).fill(0).map((_, i) => value?.item(i)), [value]);

        const { disabled } = inputProps;

        useImperativeHandle(ref, () => ({
            reset: () => {
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            },
        }));

        return (
            <label
                className={clsx(
                    'form-file-input__root',
                    !valid && 'form-file-input__invalid',
                    disabled && 'form-file-input__disabled',
                    dragOver && 'form-file-input__hovering',
                    className
                )}
                onDragOver={() => setDragOver(true)}
                onDragLeave={() => setDragOver(false)}
            >
                <div className="form-file-input__wrapper">
                    {files.length === 0 || disableFileNames
                        ? placeholder && <div className="form-file-input__empty">{placeholder}</div>
                        : files.map((f, i) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <div key={i} className="form-file-input__fileName">
                                  {f?.name}
                              </div>
                          ))}
                    <Button.Text className="form-file-input__button" disabled={disabled} label={buttonTitle} />
                    <input
                        className="form-file-input__input"
                        type="file"
                        onChange={(e) => onChange(e.target.files)}
                        ref={inputRef}
                        {...inputProps}
                    />
                </div>
                <ErrorMessage>{error}</ErrorMessage>
            </label>
        );
    }
);
