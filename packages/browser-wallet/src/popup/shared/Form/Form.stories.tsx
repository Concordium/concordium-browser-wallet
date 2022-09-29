/* eslint-disable no-console */
/* eslint-disable react/function-component-definition */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import Form from './Form';
import FormInput from './Input';
import Submit from './Submit';
import FormPassword from './Password';
import FormToggleCheckbox from './ToggleCheckbox';

export default {
    title: 'Shared/Form',
    component: Form,
} as ComponentMeta<typeof Form>;

export const AllFields: ComponentStory<typeof Form> = () => {
    return (
        <>
            <style>
                {`
                    form {
                        width: 300px;
                    }

                    form > * {
                        margin-bottom: 10px;
                    }

                    .submit {
                        margin: 0 auto;
                        display: block;
                    }
                `}
            </style>
            <Form<{ name: string; age: string; password: string; switch: boolean }> onSubmit={console.log}>
                {(f) => (
                    <>
                        <FormInput
                            register={f.register}
                            name="name"
                            label="Name"
                            note="Both first name and last name"
                        />
                        <FormInput
                            register={f.register}
                            name="age"
                            type="number"
                            label="Age"
                            rules={{ required: 'Must fill', min: { value: 18, message: 'Must be at least 18' } }}
                        />
                        <FormPassword
                            control={f.control}
                            name="password"
                            label="Password"
                            rules={{ required: 'Must fill' }}
                        />
                        <FormToggleCheckbox register={f.register} name="switch" defaultChecked />
                        <Submit className="submit" width="wide">
                            Submit
                        </Submit>
                    </>
                )}
            </Form>
        </>
    );
};
