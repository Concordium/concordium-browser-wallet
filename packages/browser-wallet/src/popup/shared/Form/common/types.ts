import { ControllerRenderProps, UseFormRegisterReturn } from 'react-hook-form';

export type RequiredFormFieldProps = { error?: string; valid?: boolean };
export type RequiredControlledFieldProps = RequiredFormFieldProps & Omit<Partial<ControllerRenderProps>, 'ref'>;
export type RequiredUncontrolledFieldProps = RequiredFormFieldProps &
    Partial<Pick<UseFormRegisterReturn, 'name' | 'onBlur' | 'onChange' | 'disabled'>>;

export type CommonFieldProps = {
    label?: string;
    note?: string;
};
