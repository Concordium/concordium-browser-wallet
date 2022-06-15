/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React, { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Password } from './Password';

export default {
    title: 'Shared/Form/Password',
    component: Password,
} as ComponentMeta<typeof Password>;

const Template: ComponentStory<typeof Password> = (args) => {
    const [value, setValue] = useState<string>();

    return (
        <div style={{ width: 300 }}>
            <Password {...args} value={value} onChange={async (e) => setValue(e.target.value)} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Label',
};

export const StrenghCheck = Template.bind({});
StrenghCheck.args = {
    label: 'Label',
    showStrength: true,
};

export const Invalid = Template.bind({});
Invalid.args = {
    label: 'Label',
    error: 'This is an error',
};

export const Valid = Template.bind({});
Valid.args = {
    label: 'Label',
    valid: true,
};
