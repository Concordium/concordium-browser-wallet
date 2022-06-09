import { ChangeEventHandler, FocusEventHandler } from 'react';
import { ControllerRenderProps, UseFormRegisterReturn } from 'react-hook-form';

export type RequiredFormFieldProps = {
    error?: string;
    valid?: boolean;
    onChange?: ChangeEventHandler;
    onBlur?: FocusEventHandler;
};
export type RequiredControlledFieldProps = RequiredFormFieldProps & Omit<Partial<ControllerRenderProps>, 'ref'>;
export type RequiredUncontrolledFieldProps = RequiredFormFieldProps &
    Partial<Pick<UseFormRegisterReturn, 'name' | 'disabled'>>;

export type CommonFieldProps = {
    label?: string;
    note?: string;
};
