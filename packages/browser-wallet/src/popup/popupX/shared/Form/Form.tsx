import { WithRef } from '@shared/utils/types';
import React, { forwardRef, Ref } from 'react';
import {
    DefaultValues,
    FieldValues,
    SubmitHandler,
    UseFormProps,
    UseFormReturn,
    useForm as useFormLib,
    FormProvider,
} from 'react-hook-form';
import { ClassName, Id } from 'wallet-common-helpers';

const useFormDefaults: Pick<UseFormProps, 'mode'> = {
    mode: 'onTouched',
};

/**
 * @description
 * The 'useForm' hook with our own preferred defaults.
 */
export const useForm = <TFormValues extends FieldValues = FieldValues>(
    props?: UseFormProps<TFormValues>
): UseFormReturn<TFormValues> => useFormLib<TFormValues>({ ...useFormDefaults, ...props });

type FormProps<TFormValues extends FieldValues = FieldValues> = Id &
    ClassName & {
        /**
         * Submit handler, receiving the values of the form as arg.
         */
        onSubmit: SubmitHandler<TFormValues>;
        /**
         * Optional form methods from 'react-hook-form' useForm, if form methods need to be accessed outside of the form.
         */
        formMethods?: UseFormReturn<TFormValues>;
        /**
         * Default values of the entire form.
         */
        defaultValues?: DefaultValues<TFormValues>;
        /**
         * Function passing form methods to function body. Should be used to register form components (using register/control) to the form context.
         */
        children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
    };

/**
 * @description
 * Component used for composing forms. It exposes everything from the 'useForm' hook through render props.
 *
 * Fields rendered inside the <Form> are required to register to the form using either 'register' for uncontrolled fields, and 'control' for controlled fields.
 * This is done to ensure as much type safety as possible.
 *
 * @example
 *  type SomeFormState = {
 *      address: string;
 *      date: Date | undefined;
 *  }
 *
 *  <Form<SomeFormState> onSubmit={handleSubmit}>
 *      {(f)=> (
 *          <>
 *              <FormInput register={f.register} name="address" rules={{required: 'Must enter address'}} />
 *              <DatePicker control={f.control} name="date" />
 *              <Submit>Submit</Submit>
 *          </>
 *      )}
 *  </Form>
 */
const Form = forwardRef(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <V extends Record<string, any>>(
        { onSubmit, formMethods: external, defaultValues, children, className, id }: FormProps<V>,
        ref: Ref<HTMLFormElement>
    ) => {
        const internal = useForm<V>({ defaultValues });
        const methods = external ?? internal;

        return (
            <FormProvider {...methods}>
                <form id={id} className={className} onSubmit={methods.handleSubmit(onSubmit)} ref={ref}>
                    {children(methods)}
                </form>
            </FormProvider>
        );
    }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default Form as <V extends Record<string, any>>(props: WithRef<FormProps<V>, HTMLFormElement>) => JSX.Element;
