import { ControllerFieldState, ControllerRenderProps, UseFormRegisterReturn } from 'react-hook-form';

export type RequiredFormFieldProps = Partial<ControllerFieldState>;
export type RequiredControlledFieldProps = RequiredFormFieldProps & Omit<ControllerRenderProps, 'ref'>;
export type RequiredUncontrolledFieldProps = RequiredFormFieldProps & UseFormRegisterReturn;

export type CommonFormFieldProps = {
    label?: string | JSX.Element;
};
