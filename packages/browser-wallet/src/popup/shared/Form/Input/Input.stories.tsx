/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

export default {
    title: 'Shared/Form/Input',
    component: Input,
} as Meta<typeof Input>;

type Story = StoryObj<typeof Input>;

const render: Story['render'] = (args) => {
    const [value, setValue] = useState<string>();

    return (
        <div style={{ width: 300 }}>
            <Input {...args} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
    );
};

export const Primary: Story = {
    render,
    args: {
        label: 'Label',
        type: 'text',
    },
};
export const WithNote: Story = {
    render,
    args: {
        label: 'Label',
        note: 'This is a note',
        type: 'text',
    },
};
export const Number: Story = {
    render,
    args: {
        label: 'Label',
        type: 'number',
    },
};
export const Invalid: Story = {
    render,
    args: {
        label: 'Label',
        type: 'text',
        error: 'This is an error',
    },
};
export const Valid: Story = {
    render,
    args: {
        label: 'Label',
        type: 'text',
        valid: true,
    },
};
