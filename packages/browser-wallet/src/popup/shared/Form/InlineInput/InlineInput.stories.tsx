/* eslint-disable react/function-component-definition, import/no-extraneous-dependencies */
import React, { useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { InlineInput } from './InlineInput';

export default {
    title: 'Shared/Form/InlineInput',
    component: InlineInput,
} as ComponentMeta<typeof InlineInput>;

const Template: ComponentStory<typeof InlineInput> = (args) => {
    const [value, setValue] = useState<string>();

    return (
        <>
            I want to pay: <InlineInput {...args} value={value} onChange={(v) => setValue(v)} /> CCD
        </>
    );
};

export const Text = Template.bind({});
Text.args = {
    label: 'Label',
    type: 'text',
    fallbackValue: '0',
};

export const Number = Template.bind({});
Number.args = {
    label: 'Label',
    type: 'number',
    fallbackValue: '0',
};

export const Invalid = Template.bind({});
Invalid.args = {
    label: 'Label',
    type: 'text',
    error: 'This is an error',
    fallbackValue: '0',
};
