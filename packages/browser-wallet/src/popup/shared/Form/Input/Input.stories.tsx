/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Input } from './Input';

export default {
    title: 'Shared/Form/Input',
    component: Input,
} as ComponentMeta<typeof Input>;

const Template: ComponentStory<typeof Input> = (args) => {
    const [value, setValue] = useState<string>();

    return (
        <div style={{ width: 300 }}>
            <Input {...args} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Label',
    type: 'text',
};

export const WithNote = Template.bind({});
WithNote.args = {
    label: 'Label',
    note: 'This is a note',
    type: 'text',
};

export const Number = Template.bind({});
Number.args = {
    label: 'Label',
    type: 'number',
};

export const Invalid = Template.bind({});
Invalid.args = {
    label: 'Label',
    type: 'text',
    error: 'This is an error',
};

export const Valid = Template.bind({});
Valid.args = {
    label: 'Label',
    type: 'text',
    valid: true,
};
