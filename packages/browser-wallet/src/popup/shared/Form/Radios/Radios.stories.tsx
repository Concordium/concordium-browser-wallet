/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { ComponentMeta, ComponentStory } from '@storybook/react';
import Radios, { RadiosProps } from './Radios';

export default {
    title: 'Shared/Form/Radios',
    component: Radios,
} as ComponentMeta<typeof Radios>;

const Template: ComponentStory<typeof Radios> = (args) => {
    const [value, setValue] = useState<number | undefined>(args.value);

    return (
        <div style={{ width: 300 }}>
            <Radios {...args} onChange={setValue} value={value} />
        </div>
    );
};

const options: RadiosProps<number>['options'] = [
    { value: 1, label: 'First' },
    { value: 2, label: 'Second' },
    { value: 3, label: 'Third' },
    { value: 4, label: 'Fourth' },
];

export const Primary = Template.bind({});
Primary.args = {
    options,
    value: 1,
};

export const WithLabel = Template.bind({});
WithLabel.args = {
    options: options.slice(0, 3),
    label: 'Select an option',
};

export const Invalid = Template.bind({});
Invalid.args = {
    options: options.slice(0, 2),
    label: 'Select an option',
    valid: false,
    error: 'An option must be selected',
};
