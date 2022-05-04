import { ControllerFieldState, ControllerRenderProps, UseFormRegisterReturn } from 'react-hook-form';

export type RequiredFormFieldProps = Partial<Pick<ControllerFieldState, 'error'>>;
export type RequiredControlledFieldProps = RequiredFormFieldProps & Omit<ControllerRenderProps, 'ref'>;
export type RequiredUncontrolledFieldProps = RequiredFormFieldProps & Omit<UseFormRegisterReturn, 'ref'>;

export type CommonFieldProps = {
    label?: string | JSX.Element;
    note?: string | JSX.Element;
};
