/* eslint-disable react/function-component-definition */
import React, { ChangeEvent, ComponentType, ForwardRefExoticComponent, FocusEvent } from 'react';
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    RegisterOptions,
    UseFormRegister,
    useFormState,
} from 'react-hook-form';
import { MakeRequired, noOp } from 'wallet-common-helpers';

import { RequiredControlledFieldProps, RequiredUncontrolledFieldProps } from './types';

type MakeControlledProps<TFieldValues extends FieldValues = FieldValues> = Omit<
    MakeRequired<ControllerProps<TFieldValues>, 'control'>,
    'render'
>;

/**
 * @description
 * Can be used to create form fields for controlled fields, i.e. where field state is kept outside.
 * It uses the internal ref of elements to update the form state, so components are required to pass a ref to an underlying input.
 *
 * @example
 * type Props = RequiredControlledFieldProps & { test: string };
 * const Field = ({value, onChange, onBlur, test}: Props) => {
 *     return <input value={value} onChange={(e) => onChange(e.target.value)} onBlur={() => onBlur()} />;
 * };

 * const FormField = makeControlled(Field);
 * <FormField<{ test: string }> control={control} name="test" test="string" />;
 */
export const makeControlled = <TProps extends RequiredControlledFieldProps>(Field: ComponentType<TProps>) => {
    type OwnProps = Omit<TProps, 'name' | 'value'>;
    return <TFieldValues extends FieldValues>(props: OwnProps & MakeControlledProps<TFieldValues>) => {
        // Filter away all props required for '<Controller />', leaving the props for the input '<Field />'
        const {
            name,
            control,
            rules,
            defaultValue,
            shouldUnregister,
            onChange: ownOnChange = noOp,
            onBlur: ownOnBlur = noOp,
            ...ownProps
        } = props;
        const controllerProps = { name, control, rules, defaultValue, shouldUnregister };

        return (
            <Controller
                render={({
                    field: { ref, ...fieldProps },
                    fieldState: { error, isTouched },
                    formState: { isSubmitted },
                }) => {
                    const onChange: typeof fieldProps['onChange'] = (...args) => {
                        ownOnChange(...args);
                        return fieldProps.onChange(...args);
                    };
                    const onBlur: typeof fieldProps['onBlur'] = () => {
                        ownOnBlur();
                        return fieldProps.onBlur();
                    };

                    // Mix Fields own props with generated props from Controller
                    const newProps: TProps = {
                        ...ownProps,
                        ...fieldProps,
                        onChange,
                        onBlur,
                        error: error?.message,
                        valid: !error?.message && (isTouched || isSubmitted) && Object.keys(rules ?? {}).length > 0,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any;

                    return <Field {...newProps} />;
                }}
                {...controllerProps}
            />
        );
    };
};

type MakeUncontrolledProps<TFieldValues extends FieldValues = FieldValues> = {
    name: FieldPath<TFieldValues>;
    rules?: RegisterOptions<TFieldValues>;
    register: UseFormRegister<TFieldValues>;
};

/**
 * @description
 * Can be used to create form fields for uncontrolled form elements.
 * It uses the internal ref of elements to update the form state, so components are required to pass a ref to an underlying input.
 *
 * @example
 * type Props = RequiredUncontrolledFieldProps & { test: string };
 * const Field = forwardRef<HTMLInputElement, Props>(({ test, ...props }, ref) => {
 *     return <input ref={ref} {...props} />;
 * });

 * const FormField = makeUncontrolled(Field);
 * <FormField<{ test: string }> register={register} name="test" test="string" />;
 */
export const makeUncontrolled = <E, P extends RequiredUncontrolledFieldProps<E>>(
    Field: ForwardRefExoticComponent<P>
) => {
    type OwnProps = Omit<P, 'ref' | 'name'>;
    return <TFieldValues extends FieldValues>(props: OwnProps & MakeUncontrolledProps<TFieldValues>) => {
        // Filter away all props required for form registration, leaving the props for the input '<Field />'
        const { name, rules, register, onChange: ownOnChange = noOp, onBlur: ownOnBlur = noOp, ...ownProps } = props;
        const registerProps = register(name, rules);
        const { errors, touchedFields, isSubmitted } = useFormState<TFieldValues>(name);

        const error = errors[name];
        const isTouched = touchedFields[name];

        const onChange = (e: ChangeEvent<E>) => {
            ownOnChange(e);
            registerProps.onChange(e);
        };
        const onBlur = (e: FocusEvent<E>) => {
            ownOnBlur(e);
            registerProps.onBlur(e);
        };

        // Mix Fields own props with generated props from field registration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newProps: P = {
            ...ownProps,
            ...registerProps,
            onChange,
            onBlur,
            error: error?.message,
            valid: !error?.message && (isTouched || isSubmitted) && Object.keys(rules ?? {}).length > 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        return <Field {...newProps} />;
    };
};
