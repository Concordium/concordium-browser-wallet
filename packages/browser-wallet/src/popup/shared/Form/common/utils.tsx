/* eslint-disable react/function-component-definition */
import React, { ComponentType } from 'react';
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    RegisterOptions,
    UseFormRegister,
    useFormState,
} from 'react-hook-form';

import { noOp } from '@shared/utils/basicHelpers';
import { MakeOptional, MakeRequired } from '@shared/utils/types';
import { RequiredControlledFieldProps, RequiredUncontrolledFieldProps } from './types';

type MakeControlledProps<TFieldValues extends FieldValues = FieldValues> = Omit<
    MakeRequired<ControllerProps<TFieldValues>, 'control'>,
    'render'
>;

export const makeControlled = <TProps extends RequiredControlledFieldProps>(Field: ComponentType<TProps>) => {
    type OwnProps = Omit<MakeOptional<TProps, 'onChange' | 'onBlur'>, 'name' | 'value'>;
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
                render={({ field: { ref, ...fieldProps }, fieldState }) => {
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
                        ...fieldState,
                        onChange,
                        onBlur,
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

export const makeUncontrolled = <TProps extends RequiredUncontrolledFieldProps>(Field: ComponentType<TProps>) => {
    type OwnProps = Omit<MakeOptional<TProps, 'onChange' | 'onBlur'>, 'ref' | 'name'>;
    return <TFieldValues extends FieldValues>(props: OwnProps & MakeUncontrolledProps<TFieldValues>) => {
        // Filter away all props required for form registration, leaving the props for the input '<Field />'
        const { name, rules, register, onChange: ownOnChange = noOp, onBlur: ownOnBlur = noOp, ...ownProps } = props;
        const registerProps = register(name, rules);
        const { errors, dirtyFields, touchedFields } = useFormState<TFieldValues>(name);

        const error = errors[name];
        const invalid = error !== undefined;
        const isDirty = dirtyFields[name];
        const isTouched = touchedFields[name];

        const onChange: typeof registerProps['onChange'] = (e) => {
            ownOnChange(e);
            return registerProps.onChange(e);
        };
        const onBlur: typeof registerProps['onBlur'] = (e) => {
            ownOnBlur(e);
            return registerProps.onBlur(e);
        };

        // Mix Fields own props with generated props from field registration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newProps: TProps = {
            ...ownProps,
            ...registerProps,
            onChange,
            onBlur,
            invalid,
            error,
            isDirty,
            isTouched,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        return <Field {...newProps} />;
    };
};

// type UProps = RequiredUncontrolledFieldProps & { test: string };
// const UTest = ({ ref, ...props }: UProps) => {
//     return <input ref={ref} {...props} />;
// };

// const UncTest = makeUncontrolled(UTest);
// <UncTest<{ test: string }> name="test" test="string" />;

// // eslint-disable-next-line react/no-unused-prop-types
// type CProps = RequiredControlledFieldProps & { another: number };
// const CTest = (props: CProps) => <>{JSON.stringify(props)}</>;

// const ConTest = makeControlled(CTest);
// <ConTest<{ test: string }> name="test" another={2} />;
