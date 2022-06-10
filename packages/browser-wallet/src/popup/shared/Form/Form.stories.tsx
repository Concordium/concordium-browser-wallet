/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { noOp } from '@shared/utils/basic-helpers';
import Form from './Form';
import FormInput from './Input';
import Submit from './Submit';
import FormPassword from './Password';

export default {
    title: 'Shared/Form',
    component: Form,
} as ComponentMeta<typeof Form>;

export const AllFields: ComponentStory<typeof Form> = () => {
    return (
        <div style={{ width: 300 }}>
            <Form<{ name: string; age: string; password: string }> onSubmit={noOp}>
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
                        <Submit>Submit</Submit>
                    </>
                )}
            </Form>
        </div>
    );
};
