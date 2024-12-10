import clsx from 'clsx';
import React, {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import FolderIcon from '@assets/svgX/folder-open.svg';
import FileIcon from '@assets/svgX/file.svg';
import ErrorMessage from '../ErrorMessage';

export interface FileInputRef {
    reset(): void;
}

export type FileInputValue = FileList | null;

export type FileInputProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'accept' | 'multiple' | 'disabled' | 'className'
> & {
    value: FileInputValue;
    disableFileNames?: boolean;
    onChange(files: FileInputValue): void;
    valid: boolean;
    placeholder: string;
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
        { value, onChange, valid, error, placeholder, className, disableFileNames = false, ...inputProps },
        ref
    ): JSX.Element => {
        const { t } = useTranslation('x', { keyPrefix: 'sharedX.form.fileInput' });
        const inputRef = useRef<HTMLInputElement>(null);
        const [dragOver, setDragOver] = useState<boolean>(false);
        const files = useMemo(() => new Array(value?.length ?? 0).fill(0).map((_, i) => value?.item(i)), [value]);
        const { disabled } = inputProps;

        useImperativeHandle(ref, () => ({
            reset: () => {
                if (inputRef.current) {
                    inputRef.current.value = '';
                    onChange(null);
                }
            },
        }));

        useEffect(() => {
            const preventFileOpen = (e: DragEvent) => e.preventDefault();

            window.addEventListener('dragover', preventFileOpen);
            window.addEventListener('drop', preventFileOpen);

            return () => {
                window.removeEventListener('dragover', preventFileOpen);
                window.removeEventListener('drop', preventFileOpen);
            };
        }, []);

        return (
            <label
                className={clsx(
                    'form-file-input-x',
                    !valid && 'form-file-input-x--invalid',
                    disabled && 'form-file-input-x--disabled',
                    dragOver && 'form-file-input-x--hovering',
                    className
                )}
            >
                <div
                    className="form-file-input-x__wrapper"
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        onChange(e.dataTransfer.files);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                >
                    <FileIcon className="m-b-20" />
                    {files.length === 0 || disableFileNames
                        ? placeholder && <div className="form-file-input-x__empty">{placeholder}</div>
                        : files.map((f, i) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <div key={i} className="form-file-input-x__filename">
                                  {f?.name}
                              </div>
                          ))}
                </div>
                <ErrorMessage className="m-t-10">{error}</ErrorMessage>
                <div className="form-file-input-x__button">
                    <FolderIcon />
                    {t('selectButton')}
                </div>
                <input
                    className="form-file-input-x__input"
                    type="file"
                    onChange={(e) => onChange(e.target.files)}
                    ref={inputRef}
                    {...inputProps}
                />
            </label>
        );
    }
);
