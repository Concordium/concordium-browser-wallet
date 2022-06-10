import { ChangeEventHandler, FocusEventHandler } from 'react';
import { ControllerRenderProps, UseFormRegisterReturn } from 'react-hook-form';

export type RequiredFormFieldProps = {
    /**
     * Field error. Will also trigger an invalid state for the field.
     */
    error?: string;
    /**
     * Sets valid state of the field.
     */
    valid?: boolean;
};
export type RequiredControlledFieldProps = RequiredFormFieldProps &
    Omit<Partial<ControllerRenderProps>, 'ref' | 'onBlur'> & {
        onBlur?: () => void;
    };
export type RequiredUncontrolledFieldProps<E> = RequiredFormFieldProps &
    Partial<Pick<UseFormRegisterReturn, 'name' | 'disabled'>> & {
        onChange?: ChangeEventHandler<E>;
        onBlur?: FocusEventHandler<E>;
    };

export type CommonFieldProps = {
    /**
     * Label shown for the field.
     */
    label?: string;
    /**
     * Note, providing extra information related to the field.
     */
    note?: string;
};
