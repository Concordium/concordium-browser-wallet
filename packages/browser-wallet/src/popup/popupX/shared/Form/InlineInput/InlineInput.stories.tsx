/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { InlineInput } from './InlineInput';

export default {
    title: 'X/Shared/Form/InlineInput',
    component: InlineInput,
} as Meta<typeof InlineInput>;

type Story = StoryObj<typeof InlineInput>;

const render: Story['render'] = (args) => {
    const [value, setValue] = useState<string>();

    return (
        <>
            I want to pay: <InlineInput {...args} value={value} onChange={(v) => setValue(v)} /> CCD
        </>
    );
};

export const Text: Story = {
    render,
    args: {
        label: 'Label',
        type: 'text',
        fallbackValue: '0',
    },
};
export const Number: Story = {
    render,
    args: {
        label: 'Label',
        type: 'number',
        fallbackValue: '0',
    },
};
export const Invalid: Story = {
    render,
    args: {
        label: 'Label',
        type: 'text',
        error: 'This is an error',
        fallbackValue: '0',
    },
};
