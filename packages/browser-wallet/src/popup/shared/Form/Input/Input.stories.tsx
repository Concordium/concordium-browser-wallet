/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
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
            <Input {...args} value={value} onChange={async (e) => setValue(e.target.value)} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Label',
    note: 'This is a note',
    type: 'text',
};

export const Invalid = Template.bind({});
Invalid.args = {
    label: 'Label',
    note: 'This is a note',
    type: 'text',
    error: 'This is an error',
};
