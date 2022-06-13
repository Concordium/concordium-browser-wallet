/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { noOp } from '@shared/utils/basic-helpers';
import Form from './Form';
import FormInput from './Input';
import Submit from './Submit';

export default {
    title: 'Shared/Form',
    component: Form,
} as ComponentMeta<typeof Form>;

export const Primary: ComponentStory<typeof Form> = () => {
    return (
        <div style={{ width: 300 }}>
            <Form<{ name: string; age: string }> onSubmit={noOp}>
                {(f) => (
                    <>
                        <FormInput
                            register={f.register}
                            name="name"
                            label="Name"
                            note="Both first name and last name"
                            rules={{ required: 'Must fill' }}
                        />
                        <FormInput
                            register={f.register}
                            name="age"
                            type="number"
                            label="Age"
                            rules={{ required: 'Must fill', min: { value: 18, message: 'Must be at least 18' } }}
                        />
                        <Submit>Submit</Submit>
                    </>
                )}
            </Form>
        </div>
    );
};
