/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/function-component-definition */
import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, StoryObj } from '@storybook/react';
import Radios, { RadiosProps } from './Radios';

export default {
    title: 'Shared/Form/Radios',
    component: Radios,
} as Meta<typeof Radios>;

const options: RadiosProps<number>['options'] = [
    { value: 1, label: 'First' },
    { value: 2, label: 'Second' },
    { value: 3, label: 'Third' },
    { value: 4, label: 'Fourth' },
];

export const Primary: StoryObj<typeof Radios> = {
    render: (args) => {
        const [value, setValue] = useState<number | undefined>(args.value);

        return (
            <div style={{ width: 300 }}>
                <Radios {...args} onChange={setValue} value={value} />
            </div>
        );
    },
    args: {
        options,
        value: 1,
    },
};
