import React from 'react';
import {
    DefaultValues,
    FieldValues,
    SubmitHandler,
    UseFormProps,
    UseFormReturn,
    useForm as useFormLib,
    FormProvider,
} from 'react-hook-form';

const useFormDefaults: Pick<UseFormProps, 'mode'> = {
    mode: 'onTouched',
};

export const useForm = <TFormValues extends FieldValues = FieldValues>(
    props?: UseFormProps<TFormValues>
): UseFormReturn<TFormValues> => useFormLib<TFormValues>({ ...useFormDefaults, ...props });

type FormProps<TFormValues> = {
    onSubmit: SubmitHandler<TFormValues>;
    formMethods?: UseFormReturn<TFormValues>;
    defaultValues?: DefaultValues<TFormValues>;
    children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Form<TFormValues extends Record<string, any>>({
    onSubmit,
    formMethods: external,
    defaultValues,
    children,
}: FormProps<TFormValues>) {
    const internal = useForm<TFormValues>({ defaultValues });
    const methods = external ?? internal;

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>{children(methods)}</form>
        </FormProvider>
    );
}
