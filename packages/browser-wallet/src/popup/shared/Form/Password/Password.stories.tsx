/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Password } from './Password';

export default {
    title: 'Shared/Form/Password',
    component: Password,
} as Meta<typeof Password>;

export const Primary: StoryObj<typeof Password> = {
    render: (args) => {
        const [value, setValue] = useState<string>();

        return (
            <div style={{ width: 300 }}>
                <Password {...args} value={value} onChange={async (e) => setValue(e.target.value)} />
            </div>
        );
    },
    args: {
        label: 'Label',
        showStrength: true,
    },
};
